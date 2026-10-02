import { useState } from "react";

export default function CampaignCard({ account, campaign, actions, onAction }) {
  const [token, setToken] = useState(campaign.tokenAccepted);
  const [amount, setAmount] = useState("");
  const isCreator = account?.toLowerCase() === campaign.creator.toLowerCase();
  const isContributor = campaign.contributorAmount > 0n;
  const canContribute = campaign.active && !campaign.cancelled;

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
      {canContribute && (
        <div className="action-row">
          <input
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="token address"
          />
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="raw amount (required)"
            inputMode="numeric"
          />
          <button
            type="button"
            disabled={!token.trim() || !amount.trim()}
            onClick={() => onAction(actions.approveToken, token, amount)}
          >
            Approve token
          </button>
          <button
            type="button"
            disabled={!token.trim() || !amount.trim()}
            onClick={() =>
              onAction(actions.contribute, amount, token, campaign.id)
            }
          >
            Contribute
          </button>
        </div>
      )}
      {isContributor && (
        <div className="action-row compact">
          <span className="permission-note">
            Your contribution: {campaign.contributorAmount.toString()}
          </span>
          <button
            type="button"
            onClick={() => onAction(actions.refund, campaign.id)}
          >
            Refund contribution
          </button>
        </div>
      )}
      {isCreator && (
        <div className="action-row compact">
          <span className="permission-note">Creator controls</span>
          <button
            type="button"
            onClick={() => onAction(actions.cancel, campaign.id)}
          >
            Cancel campaign
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
      )}
    </article>
  );
}
