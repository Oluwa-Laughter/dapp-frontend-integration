function RefreshBalanceButton({ refreshBalance, refreshing, disabled }) {
  return (
    <button
      type="button"
      onClick={refreshBalance}
      disabled={disabled || refreshing}
    >
      {refreshing ? "Refreshing balance..." : "Refresh balance"}
    </button>
  );
}

export default RefreshBalanceButton;
