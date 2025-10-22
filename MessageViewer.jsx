// src/File Transer/MessageViewer.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ListGroup, Button, Alert, Spinner } from "react-bootstrap";
import { ethers } from "ethers";
import { Buffer } from "buffer";
import CryptoJS from "crypto-js";
import { fileABI } from "../components/fileABI";

const MessageViewer = ({ account, contractAddress }) => {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      if (window.ethereum && account && contractAddress) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            fileABI,
            signer
          );

          const count = await contract.getMessagesCount();
          let msgs = [];
          for (let i = 0; i < count; i++) {
            const msg = await contract.getMessage(i);
            if (msg.receiver.toLowerCase() === account.toLowerCase()) {
              msgs.push(msg);
            }
          }
          setMessages(msgs);
        } catch (error) {
          console.error("Smart Contract Error:", error);
          setError(`Failed to fetch messages: ${error.message}`);
        }
      } else {
        setError("Wallet not connected or contract address not set.");
      }
    };

    fetchMessages();
  }, [account, contractAddress]);

  const decryptMessage = async (ipfsHash) => {
    try {
      const response = await fetch(
        `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
      );
      if (!response.ok)
        throw new Error("Failed to fetch the encrypted message");
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const encryptedData = buffer.toString();

      const secretKey = prompt("Enter the secret key to decrypt the message:");
      if (!secretKey) {
        alert("Decryption cancelled.");
        return;
      }

      const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedMessage) {
        throw new Error(
          "Failed to decrypt the message. Check your secret key."
        );
      }
      alert(`Decrypted Message: ${decryptedMessage}`);
    } catch (error) {
      console.error("Decryption Error:", error);
      alert(`Failed to decrypt the message: ${error.message}`);
    }
  };

  const downloadFile = async (ipfsHash) => {
    try {
      const response = await fetch(
        `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
      );
      if (!response.ok) throw new Error("Failed to fetch the file");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `file_${ipfsHash}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download Error:", error);
      alert(`Failed to download the file: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="mt-5">
      <h3>Received Messages</h3>
      <ListGroup>
        {messages.length === 0 ? (
          <ListGroup.Item>No messages received.</ListGroup.Item>
        ) : (
          messages.map((msg, index) => (
            <ListGroup.Item key={index}>
              <p>
                <strong>From:</strong> {msg.sender}
              </p>
              <p>
                <strong>Time:</strong>{" "}
                {new Date(msg.timestamp.toNumber() * 1000).toLocaleString()}
              </p>
              {msg.ipfsHash.endsWith(".txt") ? (
                <Button
                  variant="primary"
                  onClick={() => decryptMessage(msg.ipfsHash)}
                >
                  View Message
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => downloadFile(msg.ipfsHash)}
                >
                  Download File
                </Button>
              )}
            </ListGroup.Item>
          ))
        )}
      </ListGroup>
    </div>
  );
};

MessageViewer.propTypes = {
  account: PropTypes.string.isRequired,
  contractAddress: PropTypes.string.isRequired,
};

export default MessageViewer;
