export const EIP6963AnnouceProvider = "eip6963:announce-provider";
export const EIP6963RequestProvider = "eip6963:request-provider";

export const SUPPORTED_CHAINS = {
  11155111: {
    name: "Ethereum Sepolia",
    chainId: "0xaa36a7",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
  84532: {
    name: "Base Sepolia",
    chainId: "0x14a34",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia.basescan.org"],
  },
  11142220: {
    name: "Celo Sepolia",
    chainId: "0xaa044c",
    nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
    rpcUrls: ["https://forno.celo-sepolia.celo-testnet.org"],
    blockExplorerUrls: ["https://celo-sepolia.blockscout.com"],
  },
};
