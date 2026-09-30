function BalanceDisplay({ account, balance, chainName, nativeSymbol }) {
  if (!account) {
    return <div>Connect MetaMask to view your balance.</div>;
  }

  return (
    <div>
      Balance on {chainName ?? "current network"}: {balance ?? "Loading..."}{" "}
      {nativeSymbol ?? "native token"}
    </div>
  );
}

export default BalanceDisplay;
