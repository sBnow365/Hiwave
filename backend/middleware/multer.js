const multer = require('multer');

// Store files in memory before uploading to Cloudinary
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

module.exports = upload;
