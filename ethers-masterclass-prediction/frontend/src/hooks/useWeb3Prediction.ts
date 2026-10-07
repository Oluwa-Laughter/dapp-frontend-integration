import { useCallback, useEffect, useState } from "react";
import { formatEther, parseEther, type Abi, type Address } from "viem";
import {
  useAccount,
  usePublicClient,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";

import { CONTRACTS } from "../contracts/predictionConfig";
import {
  ContractMarket,
  MarketOutcome,
  PredictionMarketData,
} from "../types/prediction";

const contractAddress = CONTRACTS.predictionMarketOracleHub.address as Address;
const contractAbi = CONTRACTS.predictionMarketOracleHub.abi as Abi;

export const usePredictionMarket = (walletAddress: string | null) => {
  const publicClient = usePublicClient({ chainId: 11155111 });
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [markets, setMarkets] = useState<PredictionMarketData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readMarketData = useCallback(
    async (market: ContractMarket): Promise<PredictionMarketData> => {
      const {
        id,
        title,
        category,
        endTime: rawEndTime,
        outcome: rawOutcome,
        totalYesPool,
        totalNoPool,
        resolved,
      } = market;

      let userYesBet = 0n;
      let userNoBet = 0n;
      let userClaimed = false;
      let userEstimatedWinnings = 0n;

      if (walletAddress && publicClient) {
        const [userBet, winnings] = await Promise.all([
          publicClient.readContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: "userBets",
            args: [id, walletAddress as Address],
          }),
          publicClient.readContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: "calculateWinnings",
            args: [id, walletAddress as Address],
          }),
        ]);

        const bet = userBet as readonly [bigint, bigint, boolean];
        userYesBet = bet[0];
        userNoBet = bet[1];
        userClaimed = bet[2];
        userEstimatedWinnings = winnings as bigint;
      }

      const endTime = Number(rawEndTime);

      return {
        id: Number(id),
        title,
        category,
        endTime,
        outcome: Number(rawOutcome) as MarketOutcome,
        totalYesPool: formatEther(totalYesPool),
        totalNoPool: formatEther(totalNoPool),
        resolved,
        userYesBet: formatEther(userYesBet),
        userNoBet: formatEther(userNoBet),
        userClaimed,
        userEstimatedWinnings: formatEther(userEstimatedWinnings),
        isExpired: endTime <= Math.floor(Date.now() / 1000),
      };
    },
    [publicClient, walletAddress],
  );

  const fetchMarkets = useCallback(async () => {
    if (!publicClient) return;

    try {
      setIsLoading(true);
      setError(null);

      const rawMarkets = await publicClient.readContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "getAllMarkets",
      });

      const processedMarkets = await Promise.all(
        (rawMarkets as ContractMarket[]).map(readMarketData),
      );
      setMarkets(processedMarkets);
    } catch (err) {
      console.error("Failed to fetch markets:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch markets");
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, readMarketData]);

  useEffect(() => {
    void fetchMarkets();
  }, [fetchMarkets]);

  useWatchContractEvent({
    address: contractAddress,
    abi: contractAbi,
    chainId: 11155111,
    eventName: "MarketCreated",
    onLogs: () => void fetchMarkets(),
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: contractAbi,
    chainId: 11155111,
    eventName: "BetPlaced",
    onLogs: () => void fetchMarkets(),
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: contractAbi,
    chainId: 11155111,
    eventName: "MarketResolved",
    onLogs: () => void fetchMarkets(),
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: contractAbi,
    chainId: 11155111,
    eventName: "WinningsClaimed",
    onLogs: () => void fetchMarkets(),
  });

  const placeBet = useCallback(
    async (marketId: number, isYes: boolean, amountEth: string) => {
      if (!address || !publicClient) {
        setError("Connect your wallet before placing a bet");
        return;
      }

      try {
        setError(null);
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: contractAbi,
          chainId: 11155111,
          functionName: "placeBet",
          args: [BigInt(marketId), isYes],
          value: parseEther(amountEth),
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (receipt.status !== "success")
          throw new Error("Transaction reverted");
        await fetchMarkets();
      } catch (err) {
        console.error("Failed to submit transaction:", err);
        setError(err instanceof Error ? err.message : "Transaction failed");
      }
    },
    [address, fetchMarkets, publicClient, writeContractAsync],
  );

  const claimWinnings = useCallback(
    async (marketId: number) => {
      if (!address || !publicClient) {
        setError("Connect your wallet before claiming winnings");
        return;
      }

      try {
        setError(null);
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: contractAbi,
          chainId: 11155111,
          functionName: "claimWinnings",
          args: [BigInt(marketId)],
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (receipt.status !== "success")
          throw new Error("Transaction reverted");
        await fetchMarkets();
      } catch (err) {
        console.error("Failed to submit transaction:", err);
        setError(err instanceof Error ? err.message : "Transaction failed");
      }
    },
    [address, fetchMarkets, publicClient, writeContractAsync],
  );

  return { markets, isLoading, error, placeBet, claimWinnings };
};
