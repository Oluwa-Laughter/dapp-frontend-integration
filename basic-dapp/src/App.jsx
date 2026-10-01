import "./App.css";
import BalanceDisplay from "./components/BalanceDisplay.jsx";
import ConnectButton from "./components/ConnectButton.jsx";
import RefreshBalanceButton from "./components/RefreshBalanceButton.jsx";
import { SUPPORTED_CHAINS } from "./constants/index.js";
import SupportedChainsList from "./components/SupportedChainsList.jsx";
import SwitchNetworkButton from "./components/SwitchNetworkButton.jsx";
import useWalletConnect from "./hooks/useWalletConnect.js";
import TokensAndBalances from "./components/TokensAndBalances.jsx";

function App() {
  const {
    account,
    balance,
    chainId,
    chainName,
    connectionError,
    isSupportedChain,
    connecting,
    balanceRefreshing,
    browserProvider,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    switchChain,
  } = useWalletConnect();

  return (
    <>
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        {/* <EIP1193/> */}
        {/* <EIP6963 /> */}

        <ConnectButton
          account={account}
          connecting={connecting}
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
        />

        <div>Account: {account}</div>
        <div>Chain ID: {chainId ?? "Not connected"}</div>
        <div>Network: {chainName ?? "Unknown network"}</div>

        <BalanceDisplay
          account={account}
          balance={balance}
          chainName={chainName}
          nativeSymbol={SUPPORTED_CHAINS[chainId]?.nativeCurrency.symbol}
        />
        <RefreshBalanceButton
          refreshBalance={refreshBalance}
          refreshing={balanceRefreshing}
          disabled={!account}
        />

        {chainId !== null && (
          <div role={isSupportedChain ? undefined : "alert"}>
            {isSupportedChain
              ? `Connected to ${chainName}.`
              : `Wrong network. Chain ID ${chainId} is not ${Object.values(
                  SUPPORTED_CHAINS,
                )
                  .map((chain) => chain.name)
                  .join(", ")}.`}
          </div>
        )}

        {account && !isSupportedChain && (
          <div>
            <p>Choose a supported network to continue:</p>
            <SwitchNetworkButton chainId={chainId} switchChain={switchChain} />
          </div>
        )}

        {connectionError && <div role="alert">{connectionError}</div>}

        <SupportedChainsList />

        <div style={{ marginTop: "20px" }}>
          <h3>TOKENS AND BALANCES MULTICALL2</h3>
          <TokensAndBalances
            account={account}
            browserProvider={browserProvider}
            chainId={chainId}
          />
        </div>
      </main>
    </>
  );
}

export default App;
