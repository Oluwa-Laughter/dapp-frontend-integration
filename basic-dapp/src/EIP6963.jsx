import { useEffect, useState } from "react";

const SUPPORTED_CHAINS = [
  { id: "0x1", name: "Ethereum Mainnet" },
  { id: "0x38", name: "Binance Smart Chain" },
];

function EIP6963() {
  const [providers, setProviders] = useState([]);
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(0);

  const [chainError, setChainError] = useState("");
  const [status, setStatus] = useState("Looking for installed wallets...");
  const [activeProvider, setActiveProvider] = useState(null);
  const [activeUuid, setActiveUuid] = useState(null);

  function checkChain(chainId) {
    const supportedChain = SUPPORTED_CHAINS.find(
      (chain) => chain.id.toLowerCase() === chainId.toLowerCase(),
    );

    setChainId(parseInt(chainId, 16));

    if (supportedChain) {
      setChainError("");
      setStatus(`Connected to ${supportedChain.name}.`);
      return;
    }

    setChainError(
      `Unsupported chain. Please switch to ${SUPPORTED_CHAINS.map((chain) => chain.name).join(" or ")}.`,
    );
    setStatus("Unsupported chain detected. Switch chain in your wallet.");
  }

  async function handleWalletConnect(provider, uuid, name) {
    try {
      if (provider) {
        setStatus(`Waiting for ${name} connection approval...`);
        const accounts = await provider.request({
          method: "eth_requestAccounts",
        });

        if (!accounts.length) {
          setStatus(`${name} did not return an account.`);
          return;
        }

        setAccount(accounts[0]);

        setStatus("Checking the connected network...");
        const chainId = await provider.request({ method: "eth_chainId" });
        setActiveProvider(provider);
        setActiveUuid(uuid);
        checkChain(chainId);
      }
    } catch (error) {
      setStatus(
        error.code === 4001
          ? `${name} connection rejected.`
          : `${name} connection failed: ${error.message}`,
      );
    }
  }

  async function handleWalletDisconnect(provider, uuid, name) {
    if (provider !== activeProvider || uuid !== activeUuid) {
      setStatus(`${name} is not connected.`);
      return;
    }

    setStatus(`Disconnecting ${name}...`);
    let permissionsRevoked = false;

    try {
      await provider.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
      permissionsRevoked = true;
    } catch (error) {
      setStatus(
        error.code === 4001
          ? `${name} permission revocation rejected.`
          : `${name} permission revocation failed: ${error.message}`,
      );
    } finally {
      setAccount("");
      setChainId(0);
      setChainError("");
      setActiveProvider(null);
      setActiveUuid(null);
      setStatus(
        permissionsRevoked
          ? `${name} disconnected and account permission revoked.`
          : `${name} disconnected from this dapp. The wallet does not support permission revocation.`,
      );
    }
  }

  useEffect(() => {
    function handleProviderAnnouncement(event) {
      setProviders((providers) => {
        const providerExists = providers.some(
          (provider) => provider.info.uuid === event.detail.info.uuid,
        );

        if (providerExists) return providers;

        const nextProviders = [...providers, event.detail];
        setStatus(
          `${nextProviders.length} wallet${nextProviders.length === 1 ? "" : "s"} found. Select one to connect.`,
        );
        return nextProviders;
      });
    }

    window.addEventListener(
      "eip6963:announceProvider",
      handleProviderAnnouncement,
    );
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener(
        "eip6963:announceProvider",
        handleProviderAnnouncement,
      );
    };
  }, []);

  useEffect(() => {
    if (!activeProvider) return;

    function handleAccountsChanged(accounts) {
      setAccount(accounts[0] ?? "");

      if (!accounts.length) {
        setChainId(0);
        setChainError("");
        setActiveProvider(null);
        setActiveUuid(null);
        setStatus("Wallet account access was removed.");
      } else {
        setStatus("The connected wallet account changed.");
      }
    }

    function handleChainChanged(chainId) {
      setStatus("The wallet network changed. Checking support...");
      checkChain(chainId);
    }

    function handleDisconnect(error) {
      setAccount("");
      setChainId(0);
      setChainError("");
      setActiveProvider(null);
      setActiveUuid(null);
      setStatus(`Wallet provider disconnected: ${error.message}`);
    }

    activeProvider.on("accountsChanged", handleAccountsChanged);
    activeProvider.on("chainChanged", handleChainChanged);
    activeProvider.on("disconnect", handleDisconnect);

    return () => {
      activeProvider.removeListener("accountsChanged", handleAccountsChanged);
      activeProvider.removeListener("chainChanged", handleChainChanged);
      activeProvider.removeListener("disconnect", handleDisconnect);
    };
  }, [activeProvider]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {providers.map((provider) => (
        <div
          key={provider.info.uuid}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <img
            src={provider.info.icon}
            alt={provider.info.name}
            width={50}
            height={50}
          />
          <p>Provider Name: {provider.info.name}</p>

          <button
            onClick={() =>
              handleWalletConnect(
                provider.provider,
                provider.info.uuid,
                provider.info.name,
              )
            }
            style={{
              padding: "12px",
              backgroundColor: "#010020",
              cursor: "pointer",
            }}
          >
            Connect {provider.info.name}
          </button>

          <button
            onClick={() =>
              handleWalletDisconnect(
                provider.provider,
                provider.info.uuid,
                provider.info.name,
              )
            }
            style={{
              padding: "12px",
              backgroundColor: "#ff0000",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Disconnect {provider.info.name}
          </button>
        </div>
      ))}

      <p>Status: {status}</p>
      <p>
        Supported chains:{" "}
        {SUPPORTED_CHAINS.map((chain) => chain.name).join(", ")}
      </p>

      {account && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <h2>Connection Established</h2>
          <p>Account Connected: {account}</p>
          <p>Chain connected: {chainId}</p>
          {chainError && <p>{chainError}</p>}
        </div>
      )}
    </div>
  );
}

export default EIP6963;
