import { SUPPORTED_CHAINS } from "../constants";

function SwitchNetworkButton({ chainId, switchChain }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {Object.entries(SUPPORTED_CHAINS).map(([supportedChainId, chain]) => (
        <button
          key={supportedChainId}
          type="button"
          onClick={() => switchChain(Number(supportedChainId))}
          disabled={chainId === Number(supportedChainId)}
        >
          {chainId === Number(supportedChainId)
            ? `${chain.name} selected`
            : `Switch to ${chain.name}`}
        </button>
      ))}
    </div>
  );
}

export default SwitchNetworkButton;
