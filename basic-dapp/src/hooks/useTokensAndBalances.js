import { useEffect, useState } from "react";
import { Contract, Interface, isAddress, formatUnits } from "ethers";
import erc20abi from "../abi/erc20.json";
import multicall2abi from "../abi/multicall2.json";
import { SUPPORTED_CHAINS } from "../constants";

const erc20Interface = new Interface(erc20abi);

export const useTokensAndBalances = (
  address,
  tokenAddress,
  chainId,
  browserProvider,
) => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const chain = SUPPORTED_CHAINS[chainId];

      if (!browserProvider || !isAddress(address) || !isAddress(tokenAddress)) {
        setTokens([]);
        return;
      }

      if (!chain?.multicall2) {
        setTokens([]);
        setError("Multicall2 is not configured for this network.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const multicall = new Contract(
          chain.multicall2,
          multicall2abi,
          browserProvider,
        );
        const calls = [
          "name()",
          "symbol()",
          "decimals()",
          "balanceOf(address)",
        ].map((functionSignature, index) => ({
          target: tokenAddress,
          callData:
            index === 3
              ? erc20Interface.encodeFunctionData(functionSignature, [address])
              : erc20Interface.encodeFunctionData(functionSignature),
        }));
        const results = await multicall.tryAggregate.staticCall(false, calls);

        if (results.some(([success]) => !success)) {
          throw new Error(
            "The token contract did not answer all ERC-20 calls.",
          );
        }

        const [name, symbol, decimals, rawBalance] = results.map(
          ([, returnData], index) =>
            erc20Interface.decodeFunctionResult(
              ["name", "symbol", "decimals", "balanceOf"][index],
              returnData,
            )[0],
        );

        if (!cancelled) {
          setTokens([
            {
              address: tokenAddress,
              name,
              symbol,
              decimals: Number(decimals),
              balance: formatUnits(rawBalance, decimals),
            },
          ]);
        }
      } catch (error) {
        if (!cancelled) {
          setTokens([]);
          setError(error.message || "Could not read this ERC-20 token.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [address, browserProvider, chainId, tokenAddress]);

  return {
    tokens,
    loading,
    error,
  };
};
