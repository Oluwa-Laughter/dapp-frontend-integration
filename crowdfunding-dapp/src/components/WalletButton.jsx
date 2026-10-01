export default function WalletButton({
  account,
  connectWallet,
  disconnectWallet,
}) {
  return account ? (
    <button type="button" onClick={disconnectWallet}>
      Disconnect {account.slice(0, 6)}...{account.slice(-4)}
    </button>
  ) : (
    <button type="button" onClick={connectWallet}>
      Connect wallet
    </button>
  );
}
