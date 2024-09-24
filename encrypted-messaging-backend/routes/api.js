const express = require('express');
const fs = require('fs-extra');
const router = express.Router();

const USERS_FILE = './data/users.json';
const MESSAGES_FILE = './data/messages.json';

// Initialize data files if they don't exist
fs.ensureFileSync(USERS_FILE);
fs.ensureFileSync(MESSAGES_FILE);

// Helper function to read JSON data from a file
const readData = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error(`Error reading file: ${filePath}`, err);
    return [];
  }
};

// Helper function to write JSON data to a file
const writeData = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing to file: ${filePath}`, err);
  }
};

// Register a new user and store their public key
router.post('/register', async (req, res) => {
  const { username, publicKey } = req.body;

  let users = await readData(USERS_FILE);

  // Check if user already exists
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(400).json({ error: 'User already exists' });
  }

  // Add new user and save to file
  users.push({ username, publicKey });
  await writeData(USERS_FILE, users);
  res.status(201).json({ message: 'User registered successfully' });
});

// Log in an existing user by checking if they are registered
router.post('/login', async (req, res) => {
  const { username, publicKey } = req.body;

  let users = await readData(USERS_FILE);

  // Check if user exists
  const userExists = users.find(user => user.username === username && user.publicKey === publicKey);
  if (!userExists) {
    return res.status(404).json({ error: 'Invalid username or public key' });
  }

  res.status(200).json({ message: 'Login successful', publicKey: userExists.publicKey });
});

// Send an encrypted message
router.post('/send-message', async (req, res) => {
  const { sender, recipient, encryptedMessage } = req.body;

  let users = await readData(USERS_FILE);
  let messages = await readData(MESSAGES_FILE);

  // Ensure the recipient exists
  const recipientExists = users.find(user => user.username === recipient);
  if (!recipientExists) {
    return res.status(404).json({ error: 'Recipient not found' });
  }

  // Add message and save to file
  messages.push({ sender, recipient, encryptedMessage, timestamp: new Date() });
  await writeData(MESSAGES_FILE, messages);
  res.status(200).json({ message: 'Message sent successfully' });
});

// Get all messages for a specific recipient
router.get('/get-messages/:recipient', async (req, res) => {
  const recipient = req.params.recipient;

  let messages = await readData(MESSAGES_FILE);

  // Filter messages for the recipient
  const recipientMessages = messages.filter(msg => msg.recipient === recipient);

  res.status(200).json(recipientMessages);
});

module.exports = router;
