import { useState, useEffect } from "react";
import Web3 from "web3";
import { Buffer } from "buffer";
import elliptic from "elliptic";
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { contractABI } from "../../contractABI"; // Ensure this path is correct

const EC = elliptic.ec;
const ec = new EC("secp256k1"); // Same curve used by Ethereum

const RegistrationPage = () => {
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
  const [validationUsername, setValidationUsername] = useState("");
  const [validationPassword, setValidationPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#90caf9",
      },
      secondary: {
        main: "#f48fb1",
      },
    },
  });

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
  console.log("hello :" + import.meta.env.VITE_TEST_VARIABLE); // Should output "Hello World"

  // Contract Instances
  const [userContract, setUserContract] = useState(null);
  const [adminContract, setAdminContract] = useState(null);
  console.log("Contract Address:", import.meta.env.VITE_CONTRACT_ADDRESS);

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
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" align="center" gutterBottom>
            🔐 Blockchain Authenticator Demo
          </Typography>

          {alertMessage && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {alertMessage}
            </Alert>
          )}

          {/* Part 1: User Registration */}
          <Card sx={{ mb: 4 }}>
            <CardHeader
              title="👤 User Registration (Coinbase Wallet)"
              sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={connectUserCoinbaseWallet}
                  >
                    🔗 Connect Coinbase Wallet
                  </Button>
                </Grid>
                {userAccount && (
                  <Grid item xs={12}>
                    <Alert severity="success">
                      Connected Account: {userAccount}
                    </Alert>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    onClick={generateKeyPair}
                  >
                    🔑 Generate Key Pair
                  </Button>
                </Grid>
                {publicKeyX && (
                  <Grid item xs={12}>
                    <Alert severity="warning">
                      <strong>Public Key:</strong>{" "}
                      <span style={{ wordBreak: "break-all" }}>
                        0x{publicKeyX}
                      </span>
                    </Alert>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={submitRegistrationRequest}
                    disabled={
                      !publicKeyX || !userAccount || !username || loading
                    }
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "📝 Register Public Key"
                    )}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Part 2: Validation */}
          <Card sx={{ mb: 4 }}>
            <CardHeader
              title="✅ User Validation"
              sx={{
                bgcolor: "secondary.main",
                color: "secondary.contrastText",
              }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    variant="outlined"
                    value={validationUsername}
                    onChange={(e) => setValidationUsername(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    variant="outlined"
                    value={validationPassword}
                    onChange={(e) => setValidationPassword(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="3rd Factor Authentication "
                    variant="outlined"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    onClick={() => validateSignatureOffChain(message)}
                    disabled={loading || !message}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Validate Signature"
                    )}
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={getAuditLogs}
                  >
                    📋 Get Audit Logs
                  </Button>
                </Grid>
                {auditLogs.length > 0 && (
                  <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 2 }}>
                      <Typography variant="h6">Audit Logs</Typography>
                      <List>
                        {auditLogs.map((log, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={`User: ${log.returnValues.user}`}
                              secondary={`Public Key: ${log.returnValues.publicKey}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Admin Panel */}
          <Card>
            <CardHeader
              title="🛡️ Admin Panel (MetaMask)"
              sx={{ bgcolor: "success.main", color: "success.contrastText" }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={connectAdminMetaMask}
                  >
                    🔗 Connect MetaMask
                  </Button>
                </Grid>
                {adminAccount && (
                  <Grid item xs={12}>
                    <Alert severity="success">
                      Admin Account: {adminAccount}
                    </Alert>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom>
                    Registration Requests
                  </Typography>
                  {adminRequests.length === 0 ? (
                    <Alert severity="info">No pending requests.</Alert>
                  ) : (
                    adminRequests.map((request, index) => (
                      <Paper key={index} elevation={2} sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">{request.username}</Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Public Key:</strong>{" "}
                          <span style={{ wordBreak: "break-all" }}>
                            {request.publicKey}
                          </span>
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>User Address:</strong> {request.userAddress}
                        </Typography>
                        {request.approved ? (
                          <Alert severity="success" sx={{ mt: 1 }}>
                            Approved
                          </Alert>
                        ) : (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() =>
                              approveRegistration(
                                index,
                                request.userAddress,
                                request.publicKey
                              )
                            }
                            disabled={loading}
                            sx={{ mt: 1 }}
                          >
                            {loading ? (
                              <CircularProgress size={24} />
                            ) : (
                              "Approve"
                            )}
                          </Button>
                        )}
                      </Paper>
                    ))
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default RegistrationPage;
