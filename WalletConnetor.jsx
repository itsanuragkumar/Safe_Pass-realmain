// src/components/WalletConnector.jsx

import { Button } from "react-bootstrap";

const WalletConnector = ({ setAccount }) => {
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        alert("Wallet connected successfully!");
      } catch (error) {
        console.error("Error connecting wallet:", error);
        alert("Failed to connect wallet.");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <div className="text-center my-4">
      <Button onClick={connectWallet}>Connect Wallet</Button>
    </div>
  );
};

export default WalletConnector;
