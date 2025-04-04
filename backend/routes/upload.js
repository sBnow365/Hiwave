const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinary'); // Import Cloudinary config

const router = express.Router();

// Configure Multer with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Home', // Folder name in Cloudinary
    format: async (req, file) => 'png', // Force PNG format
    public_id: (req, file) => file.originalname.split('.')[0], // Use filename as public_id
  },
});

const upload = multer({ storage });

// API Route to Upload File
router.post('/upload', upload.single('image'), (req, res) => {
  console.log("File upload response:", req.file); // Debugging log

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Use req.file.path OR req.file.url (Cloudinary stores URLs, not paths)
  const imageUrl = req.file.path || req.file.url;
  
  if (!imageUrl) {
    return res.status(500).json({ error: "Upload successful but URL not found" });
  }

  res.json({ url: imageUrl });
});

module.exports = router;
