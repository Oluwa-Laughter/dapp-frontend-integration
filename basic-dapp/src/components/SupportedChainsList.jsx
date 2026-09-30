import { SUPPORTED_CHAINS } from "../constants";

function SupportedChainsList() {
  return (
    <section>
      <h2>Supported testnets</h2>
      <ul>
        {Object.entries(SUPPORTED_CHAINS).map(([chainId, chain]) => (
          <li key={chainId}>
            {chain.name} (Chain ID: {chainId})
          </li>
        ))}
      </ul>
    </section>
  );
}

export default SupportedChainsList;
