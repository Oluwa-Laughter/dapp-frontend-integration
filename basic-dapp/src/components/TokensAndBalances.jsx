import { useState } from "react";
import { useTokensAndBalances } from "../hooks/useTokensAndBalances";

const TokensAndBalances = ({
  account: connectedAccount,
  chainId,
  browserProvider,
}) => {
  const [account, setAccount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const walletAddress = account || connectedAccount || "";
  const { tokens, loading, error } = useTokensAndBalances(
    walletAddress,
    tokenAddress,
    chainId,
    browserProvider,
  );

  return (
    <section className="token-panel">
      <div className="token-form">
        <input
          type="text"
          placeholder="wallet address"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
        />
        <p className="token-current-account">
          Current Account: {walletAddress || "Not connected"}
        </p>
      </div>
      <input
        type="text"
        placeholder="Sepolia ERC-20 token contract address"
        value={tokenAddress}
        onChange={(event) => setTokenAddress(event.target.value)}
      />
      <h2>ERC-20 balance</h2>
      {loading && <p>Reading token data...</p>}
      {error && (
        <p className="token-error" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && tokens.length === 0 && (
        <p>Enter a wallet address and a token contract address.</p>
      )}
      <div className="token-results">
        {tokens.map((token) => (
          <article className="token-card" key={token.address}>
            <div>
              <strong>{token.name}</strong> ({token.symbol})
            </div>
            <div className="token-address">{token.address}</div>
            <div>
              Balance: {token.balance} {token.symbol}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TokensAndBalances;
