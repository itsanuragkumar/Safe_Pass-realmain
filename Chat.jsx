// src/pages/Solution/Chat.jsx

import { useState } from "react";
import { ethers } from "ethers";
import { Button, Form, Alert, ListGroup, Spinner } from "react-bootstrap";
import { create } from "ipfs-http-client";

const Chat = () => {
  // State variables
  const [account, setAccount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Smart contract details
  const contractAddress = "0x07A253775c53a5cC2BCecD6F3dFcEE65866b911F"; // Replace with your contract address
  const fileAbi = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          indexed: false,
          internalType: "string",
          name: "ipfsHash",
          type: "string",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
      ],
      name: "FileSent",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_to",
          type: "address",
        },
        {
          internalType: "string",
          name: "_ipfsHash",
          type: "string",
        },
      ],
      name: "sendFile",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_index",
          type: "uint256",
        },
      ],
      name: "getFile",
      outputs: [
        {
          internalType: "address",
          name: "sender",
          type: "address",
        },
        {
          internalType: "address",
          name: "receiver",
          type: "address",
        },
        {
          internalType: "string",
          name: "ipfsHash",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getFilesCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_user",
          type: "address",
        },
      ],
      name: "getFilesForUser",
      outputs: [
        {
          components: [
            {
              internalType: "address",
              name: "sender",
              type: "address",
            },
            {
              internalType: "address",
              name: "receiver",
              type: "address",
            },
            {
              internalType: "string",
              name: "ipfsHash",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "timestamp",
              type: "uint256",
            },
          ],
          internalType: "struct FileTransfer.File[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  // Initialize IPFS client
  const ipfs = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
  });

  // Function to connect to MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        setStatus("Wallet connected!");
      } catch (error) {
        console.error("Error connecting wallet:", error);
        setStatus("Failed to connect wallet.");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // Function to get contract instance
  const getContract = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, fileAbi, signer);
    return contract;
  };

  // Function to send file
  const handleSendFile = async (e) => {
    e.preventDefault();

    // Trim the receiver address to remove any leading/trailing spaces
    const trimmedReceiver = receiver.trim();

    // Validate Ethereum address
    if (!ethers.utils.isAddress(trimmedReceiver)) {
      alert("Please enter a valid Ethereum address.");
      return;
    }

    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setStatus("Uploading file to IPFS...");

    try {
      // Upload file to IPFS
      const added = await ipfs.add(file);
      const ipfsHash = added.path;
      console.log("File uploaded to IPFS with hash:", ipfsHash);

      setStatus("Sending IPFS hash to blockchain...");

      // Interact with the smart contract
      const contract = getContract();
      const tx = await contract.sendFile(trimmedReceiver, ipfsHash);
      await tx.wait(); // Wait for the transaction to be mined
      console.log("Transaction:", tx);

      setStatus("File sent successfully!");
      setReceiver("");
      setFile(null);
    } catch (error) {
      console.error("Error:", error);
      setStatus("An error occurred while sending the file.");
    } finally {
      setLoading(false);
    }
  };

  // Function to load received files
  const loadReceivedFiles = async () => {
    if (!ethers.utils.isAddress(account)) {
      alert("Invalid account address.");
      return;
    }

    setLoading(true);
    setStatus("Fetching files from blockchain...");

    try {
      const contract = getContract();
      const filesCount = await contract.getFilesCount();
      console.log("Total files:", filesCount.toNumber());

      const fetchedFiles = [];

      for (let i = 0; i < filesCount; i++) {
        const file = await contract.getFile(i);
        if (file.receiver.toLowerCase() === account.toLowerCase()) {
          fetchedFiles.push(file);
        }
      }

      setFiles(fetchedFiles);
      setStatus("Files fetched successfully!");
    } catch (error) {
      console.error("Error fetching files:", error);
      setStatus("Failed to fetch files.");
    } finally {
      setLoading(false);
    }
  };

  // Function to download file from IPFS
  const downloadFile = async (ipfsHash, index) => {
    setStatus(`Fetching file ${index + 1} from IPFS...`);
    setLoading(true);

    try {
      const stream = ipfs.cat(ipfsHash);
      let data = [];
      for await (const chunk of stream) {
        data.push(chunk);
      }
      const blob = new Blob(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `file_${index + 1}`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus(`File ${index + 1} downloaded successfully!`);
    } catch (error) {
      console.error("Error downloading file:", error);
      setStatus(`Failed to download file ${index + 1}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Chat & File Transfer</h2>

      {!account ? (
        <Button onClick={connectWallet} variant="primary">
          Connect Wallet
        </Button>
      ) : (
        <div className="mb-4">
          <p>
            <strong>Connected Account:</strong> {account}
          </p>
        </div>
      )}

      {status && <Alert variant="info">{status}</Alert>}
      {loading && <Spinner animation="border" variant="primary" />}

      {account && (
        <>
          {/* File Uploader */}
          <Form onSubmit={handleSendFile} className="mb-5">
            <Form.Group controlId="receiver">
              <Form.Label>Receiver Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter receiver's Ethereum address"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="file" className="mt-3">
              <Form.Label>Select File</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </Form.Group>

            <Button
              variant="success"
              type="submit"
              className="mt-3"
              disabled={loading}
            >
              Send File
            </Button>
          </Form>

          {/* Load Received Files */}
          <Button
            variant="secondary"
            onClick={loadReceivedFiles}
            disabled={loading}
            className="mb-3"
          >
            Load Received Files
          </Button>

          {/* Display Received Files */}
          {files.length > 0 ? (
            <ListGroup>
              {files.map((file, index) => (
                <ListGroup.Item key={index}>
                  <p>
                    <strong>From:</strong> {file.sender}
                  </p>
                  <p>
                    <strong>IPFS Hash:</strong> {file.ipfsHash}
                  </p>
                  <p>
                    <strong>Timestamp:</strong>{" "}
                    {new Date(file.timestamp * 1000).toLocaleString()}
                  </p>
                  <Button
                    variant="outline-primary"
                    onClick={() => downloadFile(file.ipfsHash, index)}
                  >
                    Download File
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p>No files received yet.</p>
          )}
        </>
      )}
    </div>
  );
};

export default Chat;
