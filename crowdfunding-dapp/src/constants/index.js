import { JsonRpcProvider } from "ethers";

export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_HEX = "0xaa36a7";
export const SEPOLIA_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
export const CROWDFUNDING_ADDRESS =
  import.meta.env.VITE_CROWDFUNDING_ADDRESS || "";
export const MULTICALL2_ADDRESS =
  import.meta.env.VITE_MULTICALL2_ADDRESS ||
  "0xc61aF69EF4A850604b2F22332E68ac9E4881E47f";
export const sepoliaProvider = new JsonRpcProvider(SEPOLIA_RPC_URL);
