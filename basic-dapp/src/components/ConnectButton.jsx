function ConnectButton({
  account,
  connecting,
  connectWallet,
  disconnectWallet,
}) {
  return (
    <>
      {account ? (
        <button onClick={disconnectWallet}>Disconnect</button>
      ) : (
        <button onClick={connectWallet} disabled={connecting}>
          {connecting ? "Connecting to MetaMask..." : "Connect MetaMask"}
        </button>
      )}
    </>
  );
}

export default ConnectButton;
