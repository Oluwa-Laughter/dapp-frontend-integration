import { useEffect, useState } from "react";
import {
  formatUnits,
  isAddress,
  parseUnits,
  type Abi,
  type Address,
} from "viem";

import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import ConnectButton from "./ConnectButton";
import mgoAbi from "./abi/mgo.json";

const contractAddress = "0xEfF517687753FFEc4b0536a735a06FD9EB1094b3" as
  Address | undefined;

const abi = mgoAbi as Abi;

function App() {
  const { address, isConnected, chainId } = useAccount();
  const [faucetAmount, setFaucetAmount] = useState("1");
  const [recipient, setRecipient] = useState("");
  const [transferAmount, setTransferAmount] = useState("1");
  const [formError, setFormError] = useState("");

  const canRead = Boolean(contractAddress);
  const canWrite = canRead && isConnected;

  const name = useReadContract({
    address: contractAddress,
    abi,
    functionName: "name",
    query: { enabled: canRead },
  });

  const symbol = useReadContract({
    address: contractAddress,
    abi,
    functionName: "symbol",
    query: { enabled: canRead },
  });

  const decimals = useReadContract({
    address: contractAddress,
    abi,
    functionName: "decimals",
    query: { enabled: canRead },
  });

  const totalSupply = useReadContract({
    address: contractAddress,
    abi,
    functionName: "totalSupply",
    query: { enabled: canRead },
  });

  const balance = useReadContract({
    address: contractAddress,
    abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: canRead && Boolean(address) },
  });

  const {
    data: transactionHash,
    error: writeError,
    isPending: isWritePending,
    writeContract,
  } = useWriteContract();

  const transaction = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  useEffect(() => {
    if (transaction.isSuccess) {
      void Promise.all([balance.refetch(), totalSupply.refetch()]);
    }
  }, [balance, totalSupply, transaction.isSuccess]);

  const tokenDecimals = typeof decimals.data === "number" ? decimals.data : 18;
  const tokenSymbol = typeof symbol.data === "string" ? symbol.data : "tokens";
  const tokenName = typeof name.data === "string" ? name.data : "—";
  const totalSupplyValue =
    typeof totalSupply.data === "bigint"
      ? formatUnits(totalSupply.data, tokenDecimals)
      : "—";
  const balanceValue =
    typeof balance.data === "bigint"
      ? formatUnits(balance.data, tokenDecimals)
      : "—";

  function submitFaucet() {
    if (!contractAddress || !canWrite) return;
    setFormError("");

    try {
      writeContract({
        address: contractAddress,
        abi,
        functionName: "faucet",
        args: [parseUnits(faucetAmount, tokenDecimals)],
      });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Invalid faucet amount",
      );
    }
  }

  function submitTransfer() {
    if (!contractAddress || !canWrite) return;
    setFormError("");

    if (!isAddress(recipient)) {
      setFormError("Enter a valid recipient address.");
      return;
    }

    try {
      writeContract({
        address: contractAddress,
        abi,
        functionName: "transfer",
        args: [recipient, parseUnits(transferAmount, tokenDecimals)],
      });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Invalid transfer amount",
      );
    }
  }

  const readError = [
    name.error,
    symbol.error,
    decimals.error,
    totalSupply.error,
    balance.error,
  ].find(Boolean);

  return (
    <main>
      <h1>AppKit + Wagmi</h1>
      <ConnectButton />

      <section>
        <h2>Wallet</h2>
        <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
        <p>Address: {address ?? "Connect a wallet to continue"}</p>
        <p>Chain ID: {chainId ?? "—"}</p>
      </section>

      {!contractAddress && <p role="alert">No contract address found.</p>}

      <section>
        <h2>Read contract</h2>
        <p>Name: {tokenName}</p>
        <p>Symbol: {tokenSymbol}</p>
        <p>
          Decimals: {typeof decimals.data === "number" ? decimals.data : "—"}
        </p>
        <p>
          Total supply: {totalSupplyValue} {tokenSymbol}
        </p>
        <p>
          Your balance: {balanceValue} {tokenSymbol}
        </p>
        {readError && <p role="alert">{readError.message}</p>}
      </section>

      <section>
        <h2>Write contract</h2>
        <fieldset disabled={!canWrite || isWritePending}>
          <legend>Faucet</legend>
          <label>
            Amount ({tokenSymbol})
            <input
              inputMode="decimal"
              min="0"
              onChange={(event) => setFaucetAmount(event.target.value)}
              type="number"
              value={faucetAmount}
            />
          </label>
          <button onClick={submitFaucet} type="button">
            Request tokens
          </button>
        </fieldset>

        <fieldset disabled={!canWrite || isWritePending}>
          <legend>Transfer</legend>
          <label>
            Recipient
            <input
              onChange={(event) => setRecipient(event.target.value)}
              placeholder="0x..."
              type="text"
              value={recipient}
            />
          </label>
          <label>
            Amount ({tokenSymbol})
            <input
              inputMode="decimal"
              min="0"
              onChange={(event) => setTransferAmount(event.target.value)}
              type="number"
              value={transferAmount}
            />
          </label>
          <button onClick={submitTransfer} type="button">
            Transfer
          </button>
        </fieldset>

        {!isConnected && <p>Connect your wallet to submit transactions.</p>}
        {formError && <p role="alert">{formError}</p>}
        {writeError && <p role="alert">{writeError.message}</p>}
        {transactionHash && <p>Transaction: {transactionHash}</p>}
        {transaction.isLoading && <p>Waiting for transaction confirmation…</p>}
        {transaction.isSuccess && <p>Transaction confirmed.</p>}
        {transaction.error && <p role="alert">{transaction.error.message}</p>}
      </section>
    </main>
  );
}

export default App;
