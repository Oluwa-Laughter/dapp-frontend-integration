import { createAppKit } from "@reown/appkit/react";

import { WagmiProvider } from "wagmi";
import { sepolia } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

const queryClient = new QueryClient();

const projectId = "d2e75612cadd9edb7d753ed98279354a";

const metadata = {
  name: "Prediction Market",
  description: "AppKit Wagmi Integration",
  url: window.location.origin,
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

const networks = [sepolia];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [sepolia],
  defaultNetwork: sepolia,
  projectId,
  metadata,
});

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
