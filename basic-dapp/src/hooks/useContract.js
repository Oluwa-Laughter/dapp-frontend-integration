import { useCallback } from "react";
import { Contract, JsonRpcProvider } from "ethers";
import { CONTRACTS, RPC_URL } from "../constants";
import useWalletConnect from "./useWalletConnect";

export const jsonRpcProvider = new JsonRpcProvider(RPC_URL);

export const useContract = () => {
  const { signer } = useWalletConnect();

  const getContract = useCallback(
    (withSigner = false) => {
      let contract;
      if (withSigner) {
        if (!signer) return;
        contract = new Contract(
          CONTRACTS.multicall2.address,
          CONTRACTS.multicall2.abi,
          signer,
        );
      } else {
        contract = new Contract(
          CONTRACTS.multicall2.address,
          CONTRACTS.multicall2.abi,
          jsonRpcProvider,
        );
      }

      return contract;
    },
    [signer],
  );

  return {
    getContract,
  };
};
