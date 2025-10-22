// TwoFactorAuth.jsx
import React, { useState } from "react";
import axios from "axios";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import {
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Grid,
} from "@mui/material";

const ThreeFa = () => {
  const [username, setUsername] = useState("");
  const [userID, setUserID] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  // Registration Handler
  const handleRegister = async () => {
    setLoading(true);
    try {
      // Step 1: Request registration options from the server
      const response = await axios.post(
        "http://localhost:3001/generate-registration-options",
        {
          username,
        }
      );

      const options = response.data;

      // Step 2: Perform registration with WebAuthn
      const attestationResponse = await startRegistration(options);

      // Step 3: Send attestation response to the server for verification
      const verificationResponse = await axios.post(
        "http://localhost:3001/verify-registration",
        {
          userID: options.userID,
          attestationResponse,
        }
      );

      if (verificationResponse.data.verified) {
        setUserID(options.userID);
        setMessage("Registration successful!");
      } else {
        setMessage("Registration failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  // Authentication Handler
  const handleLogin = async () => {
    setLoading(true);
    try {
      // Step 1: Request authentication options from the server
      const response = await axios.post(
        "http://localhost:3001/generate-authentication-options",
        {
          userID,
        }
      );

      const options = response.data;

      // Step 2: Perform authentication with WebAuthn
      const assertionResponse = await startAuthentication(options);

      // Step 3: Send assertion response to the server for verification
      const verificationResponse = await axios.post(
        "http://localhost:3001/verify-authentication",
        {
          userID,
          authenticationResponse: assertionResponse,
        }
      );

      if (verificationResponse.data.verified) {
        setAuthenticated(true);
        setMessage("Authentication successful!");
      } else {
        setMessage("Authentication failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, margin: "auto", mt: 5 }}>
      <CardHeader title="Two-Factor Authentication with WebAuthn" />
      <CardContent>
        <Grid container spacing={2}>
          {!userID && (
            <>
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
                  onClick={handleRegister}
                  disabled={loading || !username}
                >
                  {loading ? <CircularProgress size={24} /> : "Register 2FA"}
                </Button>
              </Grid>
            </>
          )}
          {userID && !authenticated && (
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Authenticate"}
              </Button>
            </Grid>
          )}
          {authenticated && (
            <Grid item xs={12}>
              <Alert severity="success">You are authenticated!</Alert>
            </Grid>
          )}
          {message && (
            <Grid item xs={12}>
              <Alert severity="info">{message}</Alert>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ThreeFa;
