import express from "express";
import cors from "cors";
import crypto from 'crypto';

const PORT = 8080;
const app = express();
let database = { data: "Hello World", hash: "" };
let dataHistory = [{ data: database.data, timestamp: new Date(), hash: database.hash }];

// Function to compute hash of the data
const computeHash = (data: string) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Initializing the hash
database.hash = computeHash(database.data);

app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json(database);
});

app.post("/", (req, res) => {
  database.data = req.body.data;
  database.hash = computeHash(database.data); // Update hash on data change
  dataHistory.push({ data: database.data, timestamp: new Date(), hash: database.hash }); // Store history
  res.sendStatus(200);
});

app.post("/verify", (req, res) => {
  // Compare the computed hash with the stored hash
  const currentHash = computeHash(req.body.data);
  const isValid = (currentHash === database.hash);
  res.json({ isValid });
});

app.get("/recover", (req, res) => {
  const lastGoodState = dataHistory[dataHistory.length - 2]; // Assuming the last entry might be corrupted
  database.data = lastGoodState.data;
  database.hash = lastGoodState.hash;
  res.json({ data: database.data });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
