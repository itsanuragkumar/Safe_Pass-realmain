// src/components/FileUploader.jsx

import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import ipfs from "../utils/ipfs"; // Ensure this path is correct
import { sendFile } from "../utils/contract"; // Ensure this path is correct
import PropTypes from "prop-types";
import { ethers } from "ethers"; // Ensure ethers is imported

const FileUploader = ({ account }) => {
  const [receiver, setReceiver] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const isValidAddress = (address) => {
    try {
      const trimmed = address.trim();
      console.log("Validating address:", trimmed);
      const isValid = ethers.utils.isAddress(trimmed);
      console.log("Is valid:", isValid);
      return isValid;
    } catch {
      console.log("Validation error for address:", address);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedReceiver = receiver.trim();
    console.log("Receiver address after trim:", trimmedReceiver);

    if (!trimmedReceiver || !file) {
      alert("Please enter a receiver address and select a file.");
      return;
    }

    if (!isValidAddress(trimmedReceiver)) {
      alert("Please enter a valid Ethereum address.");
      return;
    }

    setStatus("Uploading file to IPFS...");

    try {
      // Upload the file to IPFS
      const added = await ipfs.add(file);
      const ipfsHash = added.path;
      console.log("File uploaded to IPFS with hash:", ipfsHash);

      setStatus("Sending IPFS hash to blockchain...");

      // Send the IPFS hash to the smart contract
      await sendFile(trimmedReceiver, ipfsHash);

      setStatus("File sent successfully!");
      setReceiver("");
      setFile(null);
    } catch (error) {
      console.error("Error:", error);
      setStatus("An error occurred while sending the file.");
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="my-4">
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
        variant="primary"
        type="submit"
        className="mt-3"
        disabled={!account}
      >
        Send File
      </Button>

      {status && (
        <Alert variant="info" className="mt-3">
          {status}
        </Alert>
      )}
    </Form>
  );
};

FileUploader.propTypes = {
  account: PropTypes.string.isRequired,
};

export default FileUploader;
