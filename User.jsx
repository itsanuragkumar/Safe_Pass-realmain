import { useState, useEffect } from "react";
import Web3 from "web3";
import elliptic from "elliptic";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CssBaseline,
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { contractABI } from "../contractABI"; // Ensure this path is correct
import { Buffer } from "buffer";

const EC = elliptic.ec;
const ec = new EC("secp256k1"); // Same curve used by Ethereum

const User = () => {
  // State Variables
  const [userWeb3, setUserWeb3] = useState(null);
  const [userAccount, setUserAccount] = useState(null);
  const [publicKeyX, setPublicKeyX] = useState("");
  const [username, setUsername] = useState("");
  // const [message, setMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [validationUsername, setValidationUsername] = useState("");
  // const [validationPassword, setValidationPassword] = useState("");
  const [auditLogs, setAuditLogs] = useState([]);
  const [pinValidationStatus, setPinValidationStatus] = useState(null); // null, 'success', 'error'
  const [tabValue, setTabValue] = useState(0);
  const PREDEFINED_PIN = "1234";

  const [enteredPIN, setEnteredPIN] = useState("");
  // const PREDEFINED_PIN = "1234";
  const password = "password123";

  // Network Configuration
  const CELO_ALFAJORES_CONFIG = {
    chainId: "0x" + parseInt(44787).toString(16), // 44787 is the decimal chain ID for Alfajores
    chainName: "Celo Alfajores Testnet",
    nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
    rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
    blockExplorerUrls: ["https://alfajores-blockscout.celo-testnet.org/"],
  };

  // Contract Address (Replace with your deployed contract address)
  const contractAddress = "0x25fAa6922F27B6eAb3E26E866225Bf1d0F8983A9";
  console.log("hello :" + import.meta.env.VITE_TEST_VARIABLE); // Should output "Hello World"

  // Contract Instances
  const [userContract, setUserContract] = useState(null);
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
  }, [userWeb3]);

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

  const lightTheme = createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#dc004e",
      },
      background: {
        default: "#f5f5f5",
      },
    },
  });
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  const validatePIN = () => {
    if (enteredPIN === PREDEFINED_PIN) {
      setPinValidationStatus("success");
      setAlertMessage("PIN validated successfully!");
    } else {
      setPinValidationStatus("error");
      setAlertMessage("Incorrect PIN. Please try again.");
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

      setAlertMessage("Registration request sent to Admin for approval!");

      // Reset user inputs
      setUsername("");
      setPublicKeyX("");
    } else {
      setAlertMessage("Error: Please provide all required information.");
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

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" align="center" gutterBottom>
            👤 User Portal
          </Typography>

          <Card elevation={3} sx={{ mb: 4 }}>
            <CardContent>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                centered
                sx={{ mb: 3 }}
              >
                <Tab label="Registration" />
                <Tab label="Login" />
              </Tabs>

              {alertMessage && (
                <Alert
                  severity="info"
                  sx={{ mb: 2 }}
                  onClose={() => setAlertMessage("")}
                >
                  {alertMessage}
                </Alert>
              )}

              {tabValue === 0 && (
                <Box>
                  <TextField
                    fullWidth
                    label="Username"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={connectUserCoinbaseWallet}
                    disabled={loading}
                    sx={{ mb: 2 }}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "🔗 Connect Coinbase Wallet"
                    )}
                  </Button>
                  {userAccount && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      Connected Account: {userAccount}
                    </Alert>
                  )}
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    onClick={generateKeyPair}
                    disabled={loading}
                    sx={{ mb: 2 }}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "🔑 Generate Key Pair"
                    )}
                  </Button>
                  {publicKeyX && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <strong>Public Key:</strong>{" "}
                      <span style={{ wordBreak: "break-all" }}>
                        0x{publicKeyX}
                      </span>
                    </Alert>
                  )}
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
                </Box>
              )}

              {tabValue === 1 && (
                <Box>
                  <TextField
                    fullWidth
                    label="Username"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="PIN"
                    type="password"
                    variant="outlined"
                    value={enteredPIN}
                    onChange={(e) => setEnteredPIN(e.target.value)}
                    placeholder="Enter your 4-digit PIN"
                    inputProps={{ maxLength: 4, pattern: "\\d{4}" }}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={validatePIN}
                    disabled={loading || !enteredPIN}
                    sx={{ mb: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : "Validate PIN"}
                  </Button>
                  {pinValidationStatus === "success" && (
                    <Alert
                      severity="success"
                      onClose={() => setPinValidationStatus(null)}
                      sx={{ mb: 2 }}
                    >
                      PIN validated successfully!
                    </Alert>
                  )}
                  {pinValidationStatus === "error" && (
                    <Alert
                      severity="error"
                      onClose={() => setPinValidationStatus(null)}
                      sx={{ mb: 2 }}
                    >
                      Incorrect PIN. Please try again.
                    </Alert>
                  )}
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    onClick={() =>
                      validateSignatureOffChain("Sample message to sign")
                    }
                    disabled={loading}
                    sx={{ mb: 2 }}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Validate Signature"
                    )}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                📋 Audit Logs
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={getAuditLogs}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : "Get Audit Logs"}
              </Button>
              {auditLogs.length > 0 && (
                <Paper
                  elevation={1}
                  sx={{ p: 2, maxHeight: 200, overflow: "auto" }}
                >
                  <List>
                    {auditLogs.map((log, index) => (
                      <ListItem key={index} divider>
                        <ListItemText
                          primary={`User: ${log.returnValues.user}`}
                          secondary={`Public Key: ${log.returnValues.publicKey}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default User; // Ensure this is the default export
