import { useState, useEffect } from "react";
import Web3 from "web3";
import elliptic from "elliptic";
import { Buffer } from "buffer";
import {
  Button,
  Container,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
  Form,
  Badge,
} from "react-bootstrap";

import { contractABI } from "../../contractABI"; // Ensure this path is correct

const EC = elliptic.ec;
const ec = new EC("secp256k1"); // Same curve used by Ethereum

const Demo = () => {
  // State Variables
  const [userWeb3, setUserWeb3] = useState(null);
  const [adminWeb3, setAdminWeb3] = useState(null);
  const [userAccount, setUserAccount] = useState(null);
  const [adminAccount, setAdminAccount] = useState(null);
  const [publicKeyX, setPublicKeyX] = useState("");
  const [username, setUsername] = useState("");
  const [adminRequests, setAdminRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [message, setMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Network Configuration
  const CELO_ALFAJORES_CONFIG = {
    chainId: "0x" + parseInt(44787).toString(16), // 44787 is the decimal chain ID for Alfajores
    chainName: "Celo Alfajores Testnet",
    nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
    rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
    blockExplorerUrls: ["https://alfajores-blockscout.celo-testnet.org/"],
  };

  // Contract Address (Replace with your deployed contract address)
  const contractAddress = "0x25fAa6922F27B6eAb3E26E864225Bf1d0F8983A9";

  // Contract Instances
  const [userContract, setUserContract] = useState(null);
  const [adminContract, setAdminContract] = useState(null);

  // Initialize Contract Instances
  useEffect(() => {
    if (userWeb3) {
      const contractInstance = new userWeb3.eth.Contract(
        contractABI,
        contractAddress
      );
      setUserContract(contractInstance);
    }
    if (adminWeb3) {
      const contractInstance = new adminWeb3.eth.Contract(
        contractABI,
        contractAddress
      );
      setAdminContract(contractInstance);
    }
  }, [userWeb3, adminWeb3]);

  // Load Registration Requests from Local Storage
  useEffect(() => {
    const storedRequests =
      JSON.parse(localStorage.getItem("registrationRequests")) || [];
    setAdminRequests(storedRequests);
  }, []);

  // Listen to Registration Requests in Local Storage
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "registrationRequests") {
        const updatedRequests = JSON.parse(event.newValue) || [];
        setAdminRequests(updatedRequests);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // User: Connect Coinbase Wallet
  const connectUserCoinbaseWallet = async () => {
    let provider;

    if (window.ethereum?.isCoinbaseWallet) {
      provider = window.ethereum;
    } else if (window.coinbaseWalletExtension) {
      provider = window.coinbaseWalletExtension;
    } else if (window.ethereum?.providers) {
      provider = window.ethereum.providers.find((p) => p.isCoinbaseWallet);
    }

    if (provider) {
      try {
        await provider.request({ method: "eth_requestAccounts" });

        // Switch to Celo Alfajores network
        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: CELO_ALFAJORES_CONFIG.chainId }],
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to Coinbase Wallet.
          if (switchError.code === 4902) {
            try {
              await provider.request({
                method: "wallet_addEthereumChain",
                params: [CELO_ALFAJORES_CONFIG],
              });
            } catch {
              throw new Error("Failed to add Celo Alfajores network.");
            }
          } else {
            throw new Error("Failed to switch to Celo Alfajores network.");
          }
        }

        const web3Instance = new Web3(provider);
        setUserWeb3(web3Instance);

        const accounts = await web3Instance.eth.getAccounts();
        setUserAccount(accounts[0]);

        setAlertMessage("User Coinbase Wallet Connected to Celo Alfajores!");
      } catch (error) {
        console.error("Connection error", error);
        setAlertMessage(`Error: ${error.message}`);
      }
    } else {
      setAlertMessage(
        "Coinbase Wallet not detected. Please install the Coinbase Wallet extension or use the Coinbase Wallet mobile app."
      );
    }
  };

  // Admin: Connect MetaMask
  const connectAdminMetaMask = async () => {
    if (typeof window.ethereum !== "undefined") {
      let metamaskProvider;

      if (window.ethereum.providers) {
        metamaskProvider = window.ethereum.providers.find(
          (provider) => provider.isMetaMask
        );
      } else if (window.ethereum.isMetaMask) {
        metamaskProvider = window.ethereum;
      }

      if (metamaskProvider) {
        try {
          // Request account access
          await metamaskProvider.request({ method: "eth_requestAccounts" });

          // Switch to Celo Alfajores network
          try {
            await metamaskProvider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: CELO_ALFAJORES_CONFIG.chainId }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              // Chain not added, add it
              await metamaskProvider.request({
                method: "wallet_addEthereumChain",
                params: [CELO_ALFAJORES_CONFIG],
              });
            } else {
              throw switchError;
            }
          }

          const web3Instance = new Web3(metamaskProvider);
          setAdminWeb3(web3Instance);

          const accounts = await web3Instance.eth.getAccounts();
          setAdminAccount(accounts[0]);

          setAlertMessage("Admin MetaMask Connected to Celo Alfajores!");
        } catch (error) {
          console.error("Connection error", error);
          setAlertMessage(`Error: ${error.message}`);
        }
      } else {
        setAlertMessage(
          "MetaMask not detected. Please install the MetaMask extension."
        );
      }
    } else {
      setAlertMessage(
        "MetaMask not detected. Please install the MetaMask extension."
      );
    }
  };

  // User: Generate Key Pair
  const generateKeyPair = () => {
    const keyPair = ec.genKeyPair();
    const pubKeyX = keyPair.getPublic().getX().toString(16).padStart(64, "0");
    setPublicKeyX(pubKeyX);
    // Do NOT store or display the private key
    setAlertMessage("Key pair generated successfully!");
  };

  // User: Submit Registration Request
  const submitRegistrationRequest = () => {
    if (publicKeyX && userAccount && username) {
      const newRequest = {
        username: username,
        publicKey: "0x" + publicKeyX,
        userAddress: userAccount,
        approved: false,
      };

      // Retrieve existing requests from local storage
      const existingRequests =
        JSON.parse(localStorage.getItem("registrationRequests")) || [];

      // Add new request
      const updatedRequests = [...existingRequests, newRequest];

      // Save back to local storage
      localStorage.setItem(
        "registrationRequests",
        JSON.stringify(updatedRequests)
      );

      setAdminRequests(updatedRequests);
      setAlertMessage("Registration request sent to Admin for approval!");

      // Reset user inputs
      setUsername("");
      setPublicKeyX("");
    } else {
      setAlertMessage("Error: Please provide all required information.");
    }
  };

  // Admin: Approve Registration
  const approveRegistration = async (requestIndex, userAddress, publicKey) => {
    if (!adminAccount) {
      setAlertMessage("Error: Admin must connect MetaMask.");
      return;
    }

    if (!adminContract) {
      setAlertMessage("Error: Admin contract instance not available.");
      return;
    }

    try {
      setLoading(true);
      setAlertMessage(`Approving registration for ${userAddress}...`);

      // Ensure publicKey is a valid bytes32
      let publicKeyBytes32 = publicKey.startsWith("0x")
        ? publicKey
        : "0x" + publicKey;
      if (publicKeyBytes32.length !== 66) {
        throw new Error("Invalid public key length.");
      }

      // Estimate gas for the transaction
      let gasEstimate;
      try {
        gasEstimate = await adminContract.methods
          .registerUser(userAddress, publicKeyBytes32)
          .estimateGas({ from: adminAccount });
      } catch (gasError) {
        console.error("Gas estimation failed:", gasError);
        setAlertMessage("Error: Gas estimation failed. Transaction may fail.");
        setLoading(false);
        return;
      }

      // Function to calculate gas limit with an extra 20%
      const calculateGasLimit = (estimate) => {
        if (typeof estimate === "bigint") {
          // Use BigInt arithmetic
          return ((estimate * 120n) / 100n).toString();
        } else {
          // Use Number arithmetic
          return Math.floor(estimate * 1.2);
        }
      };

      const gasLimit = calculateGasLimit(gasEstimate);

      // Approve the user registration on-chain
      const result = await adminContract.methods
        .registerUser(userAddress, publicKeyBytes32)
        .send({
          from: adminAccount,
          gas: gasLimit,
        });

      console.log("Transaction result:", result);

      setAlertMessage(`Registration approved for ${userAddress}!`);

      // Update local storage to mark as approved
      const existingRequests =
        JSON.parse(localStorage.getItem("registrationRequests")) || [];
      existingRequests[requestIndex].approved = true;
      localStorage.setItem(
        "registrationRequests",
        JSON.stringify(existingRequests)
      );

      setAdminRequests(existingRequests);
    } catch (error) {
      console.error("Error approving registration:", error);
      setAlertMessage(
        `Error: Failed to approve registration. ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // User: Validate Signature Off-Chain
  const validateSignatureOffChain = async (message) => {
    if (!userWeb3 || !userAccount) {
      setAlertMessage(
        "Error: Connect Coinbase Wallet and generate keys first."
      );
      return;
    }
    try {
      setLoading(true);

      // Create a simple message to sign
      const msgParams = `0x${Buffer.from(message, "utf8").toString("hex")}`;

      // Send the signature request
      const signature = await userWeb3.eth.personal.sign(
        msgParams,
        userAccount,
        ""
      );

      console.log("Signature:", signature);

      // Verify the signature
      const recoveredAddress = await userWeb3.eth.personal.ecRecover(
        msgParams,
        signature
      );

      console.log("Recovered Address:", recoveredAddress);
      console.log("User Account:", userAccount);

      if (recoveredAddress.toLowerCase() === userAccount.toLowerCase()) {
        setAlertMessage("Signature is valid!");
      } else {
        setAlertMessage("Signature is invalid.");
      }
    } catch (error) {
      console.error("Error validating signature off-chain:", error);
      setAlertMessage(
        `Error: ${error.message || "Off-chain validation failed."}`
      );
    } finally {
      setLoading(false);
    }
  };

  // User: Fetch Audit Logs
  const getAuditLogs = async () => {
    if (!userWeb3 || !userAccount) {
      setAlertMessage("Error: Connect Coinbase Wallet first.");
      return;
    }
    if (!userContract) {
      setAlertMessage("Error: Contract instance not available.");
      return;
    }
    try {
      setLoading(true);
      const logs = await userContract.getPastEvents("UserRegistered", {
        filter: { user: userAccount },
        fromBlock: 0,
        toBlock: "latest",
      });
      setAuditLogs(logs);
      setAlertMessage("Audit logs fetched successfully.");
    } catch (error) {
      console.error("Error fetching audit logs:", error.message);
      setAlertMessage("Error: Could not fetch audit logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="bg-dark text-light py-5"
      style={{ minHeight: "100vh" }}
    >
      <Row className="justify-content-center">
        <Col md={10}>
          <Card bg="secondary" text="white" className="shadow-lg">
            <Card.Header className="bg-dark text-center py-3">
              <h2 className="mb-0">🔐 Blockchain Authenticator Demo</h2>
            </Card.Header>
            <Card.Body className="px-4 py-5">
              {alertMessage && (
                <Alert variant="info" className="text-dark">
                  {alertMessage}
                </Alert>
              )}

              <Row>
                {/* User Panel */}
                <Col md={6} className="mb-4 mb-md-0">
                  <Card bg="dark" text="light" className="h-100">
                    <Card.Header className="bg-primary text-dark">
                      <h4 className="mb-0">👤 User Panel (Coinbase Wallet)</h4>
                    </Card.Header>
                    <Card.Body>
                      <Form.Group className="mb-3" controlId="formUsername">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </Form.Group>

                      <Button
                        variant="outline-info"
                        onClick={connectUserCoinbaseWallet}
                        className="w-100 mb-3"
                      >
                        🔗 Connect Coinbase Wallet
                      </Button>
                      {userAccount && (
                        <Alert variant="success" className="mb-3">
                          Connected Account: {userAccount}
                        </Alert>
                      )}

                      <Button
                        variant="outline-warning"
                        onClick={generateKeyPair}
                        className="w-100 mb-3"
                      >
                        🔑 Generate Key Pair
                      </Button>
                      {publicKeyX && (
                        <Alert variant="warning" className="mb-3">
                          <strong>Public Key:</strong>{" "}
                          <small className="text-break">0x{publicKeyX}</small>
                        </Alert>
                      )}

                      <Button
                        variant="primary"
                        onClick={submitRegistrationRequest}
                        className="w-100 mb-3"
                        disabled={
                          !publicKeyX || !userAccount || !username || loading
                        }
                      >
                        {loading ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          "📝 Register Public Key"
                        )}
                      </Button>

                      <Form.Group className="mb-3" controlId="formMessage">
                        <Form.Label>Message for Validation</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter message to validate"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                      </Form.Group>

                      <Button
                        variant="outline-success"
                        onClick={() => validateSignatureOffChain(message)}
                        className="w-100 mb-3"
                        disabled={loading || !message}
                      >
                        {loading ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          "✅ Validate Signature (Off-Chain)"
                        )}
                      </Button>

                      <Button
                        variant="outline-light"
                        onClick={getAuditLogs}
                        className="w-100 mb-3"
                      >
                        📋 Get Audit Logs
                      </Button>
                      {auditLogs.length > 0 && (
                        <Card bg="dark" border="info" className="mt-3">
                          <Card.Header>Audit Logs</Card.Header>
                          <Card.Body>
                            <ul className="list-unstyled">
                              {auditLogs.map((log, index) => (
                                <li key={index} className="mb-2">
                                  <strong>User:</strong> {log.returnValues.user}
                                  <br />
                                  <strong>Public Key:</strong>{" "}
                                  <small className="text-break">
                                    {log.returnValues.publicKey}
                                  </small>
                                </li>
                              ))}
                            </ul>
                          </Card.Body>
                        </Card>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

                {/* Admin Panel */}
                <Col md={6}>
                  <Card bg="dark" text="light" className="h-100">
                    <Card.Header className="bg-success text-white">
                      <h4 className="mb-0">🛡️ Admin Panel (MetaMask)</h4>
                    </Card.Header>
                    <Card.Body>
                      <Button
                        variant="outline-success"
                        onClick={connectAdminMetaMask}
                        className="w-100 mb-3"
                      >
                        🔗 Connect MetaMask
                      </Button>
                      {adminAccount && (
                        <Alert variant="success" className="mb-3">
                          Admin Account: {adminAccount}
                        </Alert>
                      )}

                      <h5 className="mt-4 mb-3">Registration Requests</h5>
                      {adminRequests.length === 0 ? (
                        <Alert variant="info">No pending requests.</Alert>
                      ) : (
                        adminRequests.map((request, index) => (
                          <Card
                            key={index}
                            bg="secondary"
                            text="white"
                            className="mb-3"
                          >
                            <Card.Body>
                              <Card.Title>{request.username}</Card.Title>
                              <Card.Text>
                                <strong>Public Key:</strong>{" "}
                                <small className="text-break">
                                  {request.publicKey}
                                </small>
                              </Card.Text>
                              <Card.Text>
                                <strong>User Address:</strong>{" "}
                                {request.userAddress}
                              </Card.Text>
                              {request.approved ? (
                                <Badge bg="success" className="px-3 py-2">
                                  Approved
                                </Badge>
                              ) : (
                                <Button
                                  variant="success"
                                  onClick={() =>
                                    approveRegistration(
                                      index,
                                      request.userAddress,
                                      request.publicKey
                                    )
                                  }
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <Spinner animation="border" size="sm" />
                                  ) : (
                                    "Approve"
                                  )}
                                </Button>
                              )}
                            </Card.Body>
                          </Card>
                        ))
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Demo;
