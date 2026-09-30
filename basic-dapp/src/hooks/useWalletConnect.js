import { useState, useEffect, useCallback, useRef } from "react";
import { BrowserProvider, formatEther } from "ethers";
import {
  EIP6963AnnouceProvider,
  EIP6963RequestProvider,
  SUPPORTED_CHAINS,
} from "../constants";

function getWalletErrorMessage(error, fallback) {
  if (error?.code === "NETWORK_ERROR") {
    return "The wallet network changed. Your account state is being refreshed.";
  }

  if (error?.code === 4001) {
    return "The wallet request was rejected.";
  }

  return error?.message || fallback;
}

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
  const [balanceRefreshing, setBalanceRefreshing] = useState(false);
  const connectRequestInFlight = useRef(false);
  const balanceRefreshInFlight = useRef(false);
  const switchRequestInFlight = useRef(false);

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
    if (balanceRefreshInFlight.current) {
      return;
    }

    if (!browserProvider || !account) {
      setBalance(null);
      return;
    }

    balanceRefreshInFlight.current = true;
    setBalanceRefreshing(true);

    try {
      const accountBalance = await browserProvider.getBalance(account);
      setBalance(formatEther(accountBalance));
    } catch (error) {
      setConnectionError(
        getWalletErrorMessage(error, "Could not refresh balance."),
      );
    } finally {
      balanceRefreshInFlight.current = false;
      setBalanceRefreshing(false);
    }
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
            : getWalletErrorMessage(error, "MetaMask connection failed."),
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
      setConnectionError(
        getWalletErrorMessage(error, "Could not revoke wallet permission."),
      );
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

      if (!provider || !chain || !account) {
        setConnectionError(
          "Connect MetaMask before switching to a supported network.",
        );
        return;
      }

      if (switchRequestInFlight.current) {
        return;
      }

      switchRequestInFlight.current = true;

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
                ? "Adding the supported network was rejected in MetaMask."
                : getWalletErrorMessage(
                    addError,
                    "Could not add the supported network.",
                  ),
            );
          }
        } else {
          setConnectionError(
            error.code === 4001
              ? "Network change was rejected in MetaMask."
              : getWalletErrorMessage(error, "Could not change networks."),
          );
        }
      } finally {
        switchRequestInFlight.current = false;
      }
    },
    [account, provider, updateChain],
  );

  const handleAccountsChanged = useCallback(
    async (accounts) => {
      try {
        await setAccountAndSigner(accounts);

        if (accounts.length == 0) {
          setChainId(null);
          setChainName(null);
          setBalance(null);
        }
      } catch (error) {
        setConnectionError(
          getWalletErrorMessage(error, "Could not update the wallet account."),
        );
      }
    },
    [setAccountAndSigner],
  );

  const handleChainChanged = useCallback(
    async (newChainId) => {
      const nextChainId = parseInt(newChainId, 16);
      updateChain(nextChainId);

      try {
        const accounts = await provider.request({ method: "eth_accounts" });

        if (accounts.length > 0) {
          await setAccountAndSigner(accounts);
        } else {
          setBalance(null);
        }
      } catch (error) {
        setConnectionError(
          getWalletErrorMessage(error, "Could not refresh wallet state."),
        );
      }
    },
    [provider, setAccountAndSigner, updateChain],
  );

  const handleDisconnect = useCallback(async () => {
    await disconnectWallet();
  }, [disconnectWallet]);

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
        setConnectionError(
          getWalletErrorMessage(error, "Could not read MetaMask state."),
        );
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
      setBrowserProvider(new BrowserProvider(injectedProvider, "any"));
    };

    window.addEventListener(EIP6963AnnouceProvider, handleProviderAnnouncement);

    window.dispatchEvent(new Event(EIP6963RequestProvider));

    fallbackTimer = window.setTimeout(() => {
      if (window.ethereum?.isMetaMask === true) {
        setProvider(window.ethereum);
        setBrowserProvider(new BrowserProvider(window.ethereum, "any"));
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
    balanceRefreshing,
    connectWallet,
    disconnectWallet,
    refreshBalance: getBalance,
    getBalance,
    switchChain,
  };
}

export default useWalletConnect;
