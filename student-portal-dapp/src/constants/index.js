import { JsonRpcProvider } from "ethers";

export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_HEX = "0xaa36a7";
export const SEPOLIA_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
export const STUDENT_REGISTRATION_ADDRESS =
  import.meta.env.VITE_STUDENT_REGISTRATION_ADDRESS ||
  "0xa551cb621e1b7b2350049d842bf73C1c4e89a126";
export const MULTICALL2_ADDRESS =
  import.meta.env.VITE_MULTICALL2_ADDRESS ||
  "0xc61aF69EF4A850604b2F22332E68ac9E4881E47f";
export const sepoliaProvider = new JsonRpcProvider(SEPOLIA_RPC_URL);
