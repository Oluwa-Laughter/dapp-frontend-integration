import { useState, useEffect, useCallback, useRef } from "react";
import { BrowserProvider, formatEther } from "ethers";
import {
  EIP6963AnnouceProvider,
  EIP6963RequestProvider,
  SUPPORTED_CHAINS,
} from "../constants";

function useWalletConnect() {
  const [account, setAccount] = useState("");
  const [signer, setSigner] = useState(null);
  const [balance, setBalance] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [chainName, setChainName] = useState(null);
  const [provider, setProvider] = useState(null);
  const [browserProvider, setBrowserProvider] = useState(null);
  const [connectionError, setConnectionError] = useState("");
  const [connecting, setConnecting] = useState(false);
  const connectRequestInFlight = useRef(false);

  const updateChain = useCallback((nextChainId) => {
    setChainId(nextChainId);
    setChainName(SUPPORTED_CHAINS[nextChainId]?.name ?? null);
  }, []);

  const setAccountAndSigner = useCallback(
    async (accounts) => {
      if (accounts.length > 0) {
        const newAccount = accounts[0];
        setAccount(newAccount);

        const signer = await browserProvider.getSigner(newAccount);
        setSigner(signer);

        const accountBalance = await browserProvider.getBalance(newAccount);
        setBalance(formatEther(accountBalance));
      } else {
        setAccount(null);
        setSigner(null);
        setBalance(null);
      }
    },
    [browserProvider],
  );

  const getBalance = useCallback(async () => {
    if (!browserProvider || !account) {
      setBalance(null);
      return;
    }

    const accountBalance = await browserProvider.getBalance(account);
    setBalance(formatEther(accountBalance));
  }, [browserProvider, account]);

  const connectWallet = useCallback(async () => {
    if (!browserProvider) {
      setConnectionError(
        "MetaMask was not detected. Install or enable MetaMask, then reload the page.",
      );
      return;
    }

    if (connectRequestInFlight.current) {
      return;
    }

    connectRequestInFlight.current = true;
    setConnecting(true);

    try {
      setConnectionError("");
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      await setAccountAndSigner(accounts);

      const network = await browserProvider.getNetwork();
      updateChain(Number(network.chainId));
    } catch (error) {
      setConnectionError(
        error.code === -32001
          ? "MetaMask is already processing a connection request. Finish or close the MetaMask popup, then try again."
          : error.code === 4001
            ? "MetaMask connection was rejected."
            : error.message || "MetaMask connection failed.",
      );
    } finally {
      connectRequestInFlight.current = false;
      setConnecting(false);
    }
  }, [browserProvider, setAccountAndSigner, updateChain]);

  const disconnectWallet = useCallback(async () => {
    try {
      if (provider) {
        await provider.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
      }
    } catch (error) {
      console.error("Failed to revoke wallet permission:", error);
    }

    setAccount(null);
    setSigner(null);
    setChainId(null);
    setChainName(null);
    setBalance(null);
  }, [provider]);

  const switchChain = useCallback(
    async (nextChainId) => {
      const chain = SUPPORTED_CHAINS[nextChainId];

      if (!provider || !chain) {
        setConnectionError(
          "Select a supported chain and connect MetaMask first.",
        );
        return;
      }

      try {
        setConnectionError("");
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chain.chainId }],
        });
        updateChain(nextChainId);
      } catch (error) {
        if (error.code === 4902) {
          try {
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [chain],
            });
            updateChain(nextChainId);
          } catch (addError) {
            setConnectionError(
              addError.code === 4001
                ? "Adding the network was rejected in MetaMask."
                : addError.message || "Could not add the network to MetaMask.",
            );
          }
          return;
        }

        setConnectionError(
          error.code === 4001
            ? "Network switch was rejected in MetaMask."
            : error.message || "Could not switch networks in MetaMask.",
        );
      }
    },
    [provider, updateChain],
  );

  const handleAccountsChanged = useCallback(
    async (accounts) => {
      await setAccountAndSigner(accounts);

      if (accounts.length == 0) {
        setChainId(null);
        setChainName(null);
        setBalance(null);
      }
    },
    [setAccountAndSigner],
  );

  const handleChainChanged = useCallback(
    async (newChainId) => {
      updateChain(parseInt(newChainId, 16));

      await getBalance();
    },
    [getBalance, updateChain],
  );

  const handleDisconnect = useCallback(
    async (error) => {
      console.error("Wallet disocnnected with error: ", error);
      await disconnectWallet();
      console.log("handle disconnect successful...");
    },
    [disconnectWallet],
  );

  useEffect(() => {
    const init = async () => {
      try {
        const accounts = await browserProvider.send("eth_accounts", []);
        if (accounts.length == 0) {
          return;
        }
        await setAccountAndSigner(accounts);

        const network = await browserProvider.getNetwork();
        updateChain(Number(network.chainId));
      } catch (error) {
        setConnectionError(error.message || "Could not read MetaMask state.");
      }
    };

    if (!browserProvider) {
      return;
    }

    // Defer the asynchronous wallet synchronization so the effect itself does
    // not synchronously trigger state updates during the commit phase.
    Promise.resolve().then(init);
  }, [browserProvider, setAccountAndSigner, updateChain]);

  useEffect(() => {
    if (!provider) {
      return;
    }

    provider.on("chainChanged", handleChainChanged);
    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("disconnect", handleDisconnect);

    return () => {
      provider.removeListener("chainChanged", handleChainChanged);
      provider.removeListener("accountsChanged", handleAccountsChanged);
      provider.removeListener("disconnect", handleDisconnect);
    };
  }, [provider, handleAccountsChanged, handleChainChanged, handleDisconnect]);

  useEffect(() => {
    let fallbackTimer;

    const handleProviderAnnouncement = (event) => {
      const providerInfo = event.detail?.info;
      const injectedProvider = event.detail?.provider;
      const isMetaMask =
        providerInfo?.rdns === "io.metamask" ||
        providerInfo?.name?.toLowerCase() === "metamask" ||
        injectedProvider?.isMetaMask === true;

      if (!isMetaMask || !injectedProvider) {
        return;
      }

      setProvider(injectedProvider);
      setBrowserProvider(new BrowserProvider(injectedProvider));
    };

    window.addEventListener(EIP6963AnnouceProvider, handleProviderAnnouncement);

    window.dispatchEvent(new Event(EIP6963RequestProvider));

    fallbackTimer = window.setTimeout(() => {
      if (window.ethereum?.isMetaMask === true) {
        setProvider(window.ethereum);
        setBrowserProvider(new BrowserProvider(window.ethereum));
      }
    }, 100);

    return () => {
      window.clearTimeout(fallbackTimer);
      window.removeEventListener(
        EIP6963AnnouceProvider,
        handleProviderAnnouncement,
      );
    };
  }, []);

  return {
    account,
    provider,
    browserProvider,
    signer,
    balance,
    chainId,
    chainName,
    isSupportedChain: chainName !== null,
    connectionError,
    connecting,
    connectWallet,
    disconnectWallet,
    switchChain,
    getBalance,
  };
}

export default useWalletConnect;
