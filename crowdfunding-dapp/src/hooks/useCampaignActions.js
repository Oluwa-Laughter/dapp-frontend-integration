import { Contract, isAddress } from "ethers";
import crowdfundingAbi from "../abi/crowdfunding.json";
import erc20Abi from "../abi/erc20.json";
import { CROWDFUNDING_ADDRESS, SEPOLIA_CHAIN_ID } from "../constants";

export default function useCampaignActions(
  browserProvider,
  account,
  chainId,
  onComplete,
) {
  const run = async (action) => {
    if (!account || chainId !== SEPOLIA_CHAIN_ID)
      throw new Error("Connect a wallet on Ethereum Sepolia first.");
    if (!isAddress(CROWDFUNDING_ADDRESS))
      throw new Error("Configure VITE_CROWDFUNDING_ADDRESS first.");
    const signer = await browserProvider.getSigner();
    const contract = new Contract(
      CROWDFUNDING_ADDRESS,
      crowdfundingAbi,
      signer,
    );
    const transaction = await action(contract, signer);
    await transaction.wait();
    await onComplete?.();
  };

  return {
    approveToken: (token, amount) =>
      run(async (_, signer) => {
        if (!isAddress(token)) throw new Error("Enter a valid token address.");
        return new Contract(token, erc20Abi, signer).approve(
          CROWDFUNDING_ADDRESS,
          amount,
        );
      }),
    createCampaign: (target, deadline, token, amounts, statuses) =>
      run((contract) =>
        contract.createCampaign(target, deadline, token, amounts, statuses),
      ),
    contribute: (amount, token, campaignId) =>
      run((contract) => contract.contributing(amount, token, campaignId)),
    cancel: (campaignId) =>
      run((contract) => contract.cancelCampaign(campaignId)),
    refund: (campaignId) => run((contract) => contract.refundMoney(campaignId)),
    approveMilestones: (campaignId) =>
      run((contract) => contract.approveMilestones(campaignId)),
    withdraw: (campaignId) =>
      run((contract) => contract.Withdrawal(campaignId)),
  };
}
