import express from "express";
import cors from "cors";
import crypto from 'crypto';

const PORT = 8080;
const app = express();

// Generating RSA key pair for simplicity, normally you'd store these securely
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

let database = { data: "Hello World", signature: "" };

// Sign the initial data
const signData = (data: string) => {
  const signer = crypto.createSign('sha256');
  signer.update(data);
  signer.end();
  return signer.sign(privateKey, 'base64');
};

// Initializing the signature
database.signature = signData(database.data);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ data: database.data, signature: database.signature });
});

app.post("/", (req, res) => {
  database.data = req.body.data;
  database.signature = signData(database.data); // Update signature on data change
  res.sendStatus(200);
});

app.post("/verify", (req, res) => {
  // Verify the signature
  const verifier = crypto.createVerify('sha256');
  verifier.update(req.body.data);
  verifier.end();
  const isValid = verifier.verify(publicKey, req.body.signature, 'base64');
  res.json({ isValid });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
