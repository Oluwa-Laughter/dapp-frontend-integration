import "./App.css";
import BalanceDisplay from "./components/BalanceDisplay.jsx";
import ConnectButton from "./components/ConnectButton.jsx";
import { SUPPORTED_CHAINS } from "./constants/index.js";
import SwitchNetworkButton from "./components/SwitchNetworkButton.jsx";
import useWalletConnect from "./hooks/useWalletConnect.js";

function App() {
  const {
    account,
    balance,
    chainId,
    chainName,
    connectionError,
    isSupportedChain,
    connecting,
    connectWallet,
    disconnectWallet,
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

        {connectionError && <div role="alert">{connectionError}</div>}

        <SwitchNetworkButton chainId={chainId} switchChain={switchChain} />
      </main>
    </>
  );
}

export default App;
