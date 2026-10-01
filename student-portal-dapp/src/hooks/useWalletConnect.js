import { useCallback, useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { SEPOLIA_CHAIN_HEX, SEPOLIA_CHAIN_ID } from "../constants";

function getErrorMessage(error, fallback) {
  return error?.reason || error?.shortMessage || error?.message || fallback;
}

export default function useWalletConnect() {
  const [browserProvider] = useState(() =>
    window.ethereum ? new BrowserProvider(window.ethereum, "any") : null,
  );
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!window.ethereum) return undefined;

    const syncWallet = async () => {
      const accounts = await browserProvider.send("eth_accounts", []);
      const network = await browserProvider.getNetwork();
      setAccount(accounts[0] || "");
      setChainId(Number(network.chainId));
    };

    syncWallet().catch((walletError) =>
      setError(getErrorMessage(walletError, "Could not read wallet state.")),
    );

    const handleAccountsChanged = (accounts) => setAccount(accounts[0] || "");
    const handleChainChanged = (nextChainId) =>
      setChainId(Number.parseInt(nextChainId, 16));

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [browserProvider]);

  const connectWallet = useCallback(async () => {
    if (!browserProvider) {
      setError("Install MetaMask to connect a wallet.");
      return;
    }

    try {
      setError("");
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const network = await browserProvider.getNetwork();
      setAccount(accounts[0] || "");
      setChainId(Number(network.chainId));
    } catch (walletError) {
      setError(getErrorMessage(walletError, "Wallet connection failed."));
    }
  }, [browserProvider]);

  const disconnectWallet = useCallback(async () => {
    setError("");

    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
      }
    } catch (walletError) {
      setError(
        getErrorMessage(walletError, "Could not revoke wallet permission."),
      );
    }

    setAccount("");
    setChainId(null);
  }, []);

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      setError("");
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_HEX }],
      });
    } catch (walletError) {
      setError(getErrorMessage(walletError, "Could not switch to Sepolia."));
    }
  }, []);

  return {
    account,
    browserProvider,
    chainId,
    connectedToSepolia: chainId === SEPOLIA_CHAIN_ID,
    connectWallet,
    disconnectWallet,
    error,
    switchToSepolia,
  };
}
