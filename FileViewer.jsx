// src/components/FileViewer.jsx

import { useState } from "react";
import { Button, Alert, ListGroup } from "react-bootstrap";
import { getFilesForUser } from "../utils/contract"; // Ensure this path is correct
import ipfs from "../utils/ipfs"; // Ensure this path is correct
import PropTypes from "prop-types";

const FileViewer = ({ account }) => {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");

  const loadFiles = async () => {
    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }

    setStatus("Fetching files from blockchain...");

    try {
      const fetchedFiles = await getFilesForUser(account);
      setFiles(fetchedFiles);
      setStatus("");
    } catch (error) {
      console.error("Error fetching files:", error);
      setStatus("Failed to fetch files.");
    }
  };

  const downloadFile = async (ipfsHash, index) => {
    setStatus(`Fetching file ${index + 1} from IPFS...`);

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
    }
  };

  return (
    <div className="my-4">
      <h3>Received Files</h3>
      <Button onClick={loadFiles} disabled={!account} className="mb-3">
        Load Received Files
      </Button>
      {status && <Alert variant="info">{status}</Alert>}
      <ListGroup>
        {files.length === 0 && <p>No files received.</p>}
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
            <Button onClick={() => downloadFile(file.ipfsHash, index)}>
              Download File
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

FileViewer.propTypes = {
  account: PropTypes.string.isRequired,
};

export default FileViewer;
