import { useState } from "react";

export default function CampaignCard({ campaign, actions, onAction }) {
  const [token, setToken] = useState(campaign.tokenAccepted);
  const [amount, setAmount] = useState("");

  return (
    <article className="campaign-card">
      <div className="campaign-topline">
        <span>Campaign #{campaign.id}</span>
        <span
          className={
            campaign.active && !campaign.cancelled ? "status active" : "status"
          }
        >
          {campaign.cancelled
            ? "Cancelled"
            : campaign.active
              ? "Active"
              : "Inactive"}
        </span>
      </div>
      <h2>{campaign.creator}</h2>
      <dl>
        <div>
          <dt>Target</dt>
          <dd>{campaign.target.toString()}</dd>
        </div>
        <div>
          <dt>Raised</dt>
          <dd>{campaign.moneyRaised.toString()}</dd>
        </div>
        <div>
          <dt>Available</dt>
          <dd>{campaign.moneyavailable.toString()}</dd>
        </div>
        <div>
          <dt>Deadline</dt>
          <dd>{new Date(campaign.deadline * 1000).toLocaleString()}</dd>
        </div>
      </dl>
      <div className="action-row">
        <input
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="token address"
        />
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="raw amount"
        />
        <button
          type="button"
          onClick={() => onAction(actions.approveToken, token, amount)}
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() =>
            onAction(actions.contribute, amount, token, campaign.id)
          }
        >
          Contribute
        </button>
      </div>
      <div className="action-row compact">
        <button
          type="button"
          onClick={() => onAction(actions.refund, campaign.id)}
        >
          Refund
        </button>
        <button
          type="button"
          onClick={() => onAction(actions.cancel, campaign.id)}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onAction(actions.approveMilestones, campaign.id)}
        >
          Approve milestones
        </button>
        <button
          type="button"
          onClick={() => onAction(actions.withdraw, campaign.id)}
        >
          Withdraw
        </button>
      </div>
    </article>
  );
}
