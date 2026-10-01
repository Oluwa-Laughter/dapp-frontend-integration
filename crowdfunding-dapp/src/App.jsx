import { useState } from "react";
import "./App.css";
import CampaignCard from "./components/CampaignCard";
import CreateCampaignForm from "./components/CreateCampaignForm";
import WalletButton from "./components/WalletButton";
import useCampaignActions from "./hooks/useCampaignActions";
import useCampaigns from "./hooks/useCampaigns";
import useWalletConnect from "./hooks/useWalletConnect";

function App() {
  const wallet = useWalletConnect();
  const campaigns = useCampaigns(wallet.chainId);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const actions = useCampaignActions(
    wallet.browserProvider,
    wallet.account,
    wallet.chainId,
    campaigns.fetchCampaigns,
  );

  const runAction = async (action, ...args) => {
    try {
      setActionLoading(true);
      setActionError("");
      setMessage("");
      await action(...args);
      setMessage("Transaction confirmed.");
    } catch (error) {
      setActionError(error.reason || error.shortMessage || error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const createCampaign = async (form) => {
    try {
      setActionLoading(true);
      setActionError("");
      const deadline = Math.floor(new Date(form.deadline).getTime() / 1000);
      await actions.createCampaign(
        form.target,
        deadline,
        form.token,
        form.amounts
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        form.statuses
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      );
      setMessage("Campaign created.");
      return true;
    } catch (error) {
      setActionError(error.reason || error.shortMessage || error.message);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const error = wallet.error || campaigns.error || actionError;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Sepolia crowdfunding</p>
          <h1>Fund what matters.</h1>
          <p className="muted">
            Create campaigns, track progress, and manage contributions onchain.
          </p>
        </div>
        <WalletButton
          account={wallet.account}
          connectWallet={wallet.connectWallet}
          disconnectWallet={wallet.disconnectWallet}
        />
      </header>
      {wallet.account && !wallet.connectedToSepolia && (
        <div className="notice warning">
          Switch MetaMask to Sepolia before using campaigns.{" "}
          <button type="button" onClick={wallet.switchToSepolia}>
            Switch network
          </button>
        </div>
      )}
      {error && <div className="notice error">{error}</div>}
      {message && <div className="notice success">{message}</div>}

      <section className="layout">
        <CreateCampaignForm loading={actionLoading} onCreate={createCampaign} />
        <section className="panel read-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Read</p>
              <h2>Campaigns</h2>
            </div>
            <button
              type="button"
              onClick={() => campaigns.fetchCampaigns()}
              disabled={campaigns.loading}
            >
              {campaigns.loading ? "Reading..." : "Refresh"}
            </button>
          </div>
          <p className="muted">
            Campaign count and campaign records are fetched through Multicall2.
          </p>
          <div className="campaign-list">
            {campaigns.campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                actions={actions}
                onAction={runAction}
              />
            ))}
            {!campaigns.loading && campaigns.campaigns.length === 0 && (
              <p className="empty">
                No campaigns loaded. Connect to Sepolia and refresh.
              </p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
