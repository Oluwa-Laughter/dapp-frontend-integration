import erc20abi from "../abi/erc20.json";
import multicallabi from "../abi/multicall2.json";

export const EIP6963AnnouceProvider = "eip6963:announce-provider";
export const EIP6963RequestProvider = "eip6963:request-provider";
export const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";

export const CONTRACTS = {
  erc20: {
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    abi: erc20abi,
  },

  multicall2: {
    address: "0xcA11bde05977b3631167028862bE2a173976CA11",
    abi: multicallabi,
  },
};

export const SUPPORTED_CHAINS = {
  11155111: {
    name: "Ethereum Sepolia",
    chainId: "0xaa36a7",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
    multicall2: "0xcA11bde05977b3631167028862bE2a173976CA11",
  },
  84532: {
    name: "Base Sepolia",
    chainId: "0x14a34",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia.basescan.org"],
    multicall2: "0xcA11bde05977b3631167028862bE2a173976CA11",
  },
  11142220: {
    name: "Celo Sepolia",
    chainId: "0xaa044c",
    nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
    rpcUrls: ["https://forno.celo-sepolia.celo-testnet.org"],
    blockExplorerUrls: ["https://celo-sepolia.blockscout.com"],
    multicall2: "0xcA11bde05977b3631167028862bE2a173976CA11",
  },
};
