import { useEffect, useState } from "react";
import "./App.css";

function EIP1193() {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(0);

  useEffect(() => {
    async function setUp() {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);

      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      setChainId(parseInt(chainId, 16));

      window.ethereum.on("connect", () => {
        console.log("connected");
      });

      window.ethereum.on("accountsChanged", (accounts) => {
        console.log("accountsChanged", accounts);

        setAccount(accounts[0] ?? "");
      });

      window.ethereum.on("chainChanged", (chainId) => {
        console.log("chainChanged", chainId);
        setChainId(parseInt(chainId, 16));
      });
    }

    setUp();
  }, []);

  return (
    <div className="App">
      <h1>EIP-1193 Example</h1>
      <p>Account: {account}</p>
      <p>Chain ID: {chainId}</p>
    </div>
  );
}

export default EIP1193;
