import { useCallback, useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { SEPOLIA_CHAIN_HEX, SEPOLIA_CHAIN_ID } from "../constants";

const messageFor = (error, fallback) =>
  error?.reason || error?.shortMessage || error?.message || fallback;

const normalizeChainId = (value) => {
  if (typeof value === "number") return value;
  return String(value).toLowerCase().startsWith("0x")
    ? Number.parseInt(value, 16)
    : Number(value);
};

export default function useWalletConnect() {
  const [browserProvider] = useState(() =>
    window.ethereum ? new BrowserProvider(window.ethereum, "any") : null,
  );
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!window.ethereum) return undefined;

    const sync = async () => {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      const nextChainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      setAccount(accounts[0] || "");
      setChainId(normalizeChainId(nextChainId));
    };
    sync().catch((walletError) =>
      setError(messageFor(walletError, "Could not read wallet state.")),
    );

    const accountsChanged = (accounts) => setAccount(accounts[0] || "");
    const chainChanged = (nextChainId) =>
      setChainId(normalizeChainId(nextChainId));
    window.ethereum.on("accountsChanged", accountsChanged);
    window.ethereum.on("chainChanged", chainChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", accountsChanged);
      window.ethereum.removeListener("chainChanged", chainChanged);
    };
  }, [browserProvider]);

  const connectWallet = useCallback(async () => {
    if (!browserProvider) {
      setError("Install MetaMask to connect a wallet.");
      return;
    }
    try {
      setError("");
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const nextChainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      setAccount(accounts[0] || "");
      setChainId(normalizeChainId(nextChainId));
    } catch (walletError) {
      setError(messageFor(walletError, "Wallet connection failed."));
    }
  }, [browserProvider]);

  const disconnectWallet = useCallback(async () => {
    try {
      await window.ethereum?.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch (walletError) {
      setError(messageFor(walletError, "Could not revoke wallet permission."));
    }
    setAccount("");
    setChainId(null);
  }, []);

  const switchToSepolia = useCallback(async () => {
    try {
      await window.ethereum?.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_HEX }],
      });
      const nextChainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      setChainId(normalizeChainId(nextChainId));
    } catch (walletError) {
      setError(messageFor(walletError, "Could not switch to Sepolia."));
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
