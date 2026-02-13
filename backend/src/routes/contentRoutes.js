const express = require('express');
const multer = require('multer');
const path = require('path');
const { validateUpload } = require('../middleware/validation');
const fileFilter = require('../middleware/fileFilter');
const { optionalAuth, authenticateToken } = require('../middleware/auth');
const {
  uploadContent,
  getContent,
  downloadFile,
  deleteContent
} = require('../controllers/contentController');
const config = require('../config/config');

const router = express.Router();

// Configure multer with file filter
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE
  },
  fileFilter: fileFilter
});

// Routes
router.post('/upload', optionalAuth, upload.single('file'), validateUpload, uploadContent);
router.post('/content/:linkId', getContent); // POST to allow password in body
router.get('/download/:linkId', downloadFile);
router.delete('/content/:linkId', authenticateToken, deleteContent); // Requires auth

module.exports = router;