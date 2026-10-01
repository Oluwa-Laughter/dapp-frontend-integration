export default function ConnectButton({
  account,
  connectWallet,
  disconnectWallet,
}) {
  if (account) {
    return (
      <button type="button" onClick={disconnectWallet}>
        Disconnect {account.slice(0, 6)}...{account.slice(-4)}
      </button>
    );
  }

  return (
    <button type="button" onClick={connectWallet}>
      Connect wallet
    </button>
  );
}
