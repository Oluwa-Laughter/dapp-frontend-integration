import { useMemo, useState } from "react";
import { Contract, Interface, ZeroAddress, isAddress } from "ethers";
import crowdfundingAbi from "../abi/crowdfunding.json";
import multicall2Abi from "../abi/multicall2.json";
import {
  CROWDFUNDING_ADDRESS,
  MULTICALL2_ADDRESS,
  SEPOLIA_CHAIN_ID,
  sepoliaProvider,
} from "../constants";

export default function useCampaigns(chainId, account) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const campaignInterface = useMemo(() => new Interface(crowdfundingAbi), []);

  const fetchCampaigns = async () => {
    if (chainId !== SEPOLIA_CHAIN_ID)
      return setError("Connect to Ethereum Sepolia first.");
    if (!isAddress(CROWDFUNDING_ADDRESS) || !isAddress(MULTICALL2_ADDRESS))
      return setError(
        "Configure the crowdfunding and Multicall2 addresses first.",
      );

    try {
      setLoading(true);
      setError("");
      const multicall = new Contract(
        MULTICALL2_ADDRESS,
        multicall2Abi,
        sepoliaProvider,
      );
      const nextIdCall = [
        {
          target: CROWDFUNDING_ADDRESS,
          callData: campaignInterface.encodeFunctionData("NextCampignId"),
        },
      ];
      const [, nextIdResult] = await multicall.aggregate.staticCall(nextIdCall);
      const nextId = Number(
        campaignInterface.decodeFunctionResult(
          "NextCampignId",
          nextIdResult[0],
        )[0],
      );
      if (nextId === 0) return setCampaigns([]);

      const calls = Array.from({ length: nextId }, (_, campaignId) => ({
        target: CROWDFUNDING_ADDRESS,
        callData: campaignInterface.encodeFunctionData("campaign", [
          campaignId,
        ]),
      }));
      const [, results] = await multicall.aggregate.staticCall(calls);
      const campaignRecords = results.map((result, campaignId) => {
        const [
          creator,
          target,
          deadline,
          moneyRaised,
          moneyavailable,
          active,
          cancelled,
          tokenAccepted,
        ] = campaignInterface.decodeFunctionResult("campaign", result);
        return {
          id: campaignId,
          creator,
          target,
          deadline: Number(deadline),
          moneyRaised,
          moneyavailable,
          active,
          cancelled,
          tokenAccepted,
        };
      });
      const contributorAddress = isAddress(account) ? account : ZeroAddress;
      const contributorCalls = campaignRecords.map(({ id }) => ({
        target: CROWDFUNDING_ADDRESS,
        callData: campaignInterface.encodeFunctionData("contributors", [
          id,
          contributorAddress,
        ]),
      }));
      const [, contributorResults] =
        await multicall.aggregate.staticCall(contributorCalls);
      setCampaigns(
        campaignRecords.map((campaign, index) => ({
          ...campaign,
          contributorAmount: campaignInterface.decodeFunctionResult(
            "contributors",
            contributorResults[index],
          )[0],
        })),
      );
    } catch (readError) {
      setError(readError.reason || readError.shortMessage || readError.message);
    } finally {
      setLoading(false);
    }
  };

  return { campaigns, error, fetchCampaigns, loading };
}
