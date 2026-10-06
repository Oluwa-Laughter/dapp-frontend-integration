import { useLogin, usePrivy, useWallets } from "@privy-io/react-auth";
import "./App.css";

const networks: Record<string, string> = {
  "1": "Ethereum",
  "10": "Optimism",
  "137": "Polygon",
  "8453": "Base",
  "42161": "Arbitrum One",
  "11155111": "Sepolia",
};

function App() {
  const { ready, authenticated, logout } = usePrivy();
  const { login } = useLogin();
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const chainId = wallet?.chainId?.replace("eip155:", "") ?? "—";
  const network = networks[chainId] ?? (chainId === "—" ? "—" : "Unknown");

  if (!ready) {
    return <main className="app-shell">Loading wallet...</main>;
  }

  return (
    <main className="app-shell">
      <section className="wallet">
        <h1>Wallet</h1>
        <button
          type="button"
          onClick={() => (authenticated ? void logout() : login())}
        >
          {authenticated ? "Disconnect" : "Connect"}
        </button>

        {authenticated && wallet && (
          <dl>
            <div>
              <dt>Account</dt>
              <dd>{wallet.address}</dd>
            </div>
            <div>
              <dt>Chain ID</dt>
              <dd>{chainId}</dd>
            </div>
            <div>
              <dt>Network</dt>
              <dd>{network}</dd>
            </div>
          </dl>
        )}
      </section>
    </main>
  );
}

export default App;
