import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PrivyProvider } from "@privy-io/react-auth";
import App from "./App.tsx";
import "./index.css";

const appId = import.meta.env.VITE_PRIVY_APP_ID || "missing-privy-app-id";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          accentColor: "#b8ff3d",
          theme: "#11130f",
          showWalletLoginFirst: true,
        },
        loginMethods: ["wallet"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      <App />
    </PrivyProvider>
  </StrictMode>,
);
