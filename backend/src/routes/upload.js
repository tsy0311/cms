const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// @route   POST /api/upload
// @desc    Upload product image
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  res.json({
    success: true,
    data: {
      filename: req.file.filename,
      path: `/uploads/products/${req.file.filename}`,
      url: `${req.protocol}://${req.get('host')}/uploads/products/${req.file.filename}`
    }
  });
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple product images
// @access  Private/Admin
router.post('/multiple', protect, admin, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }

  const files = req.files.map(file => ({
    filename: file.filename,
    path: `/uploads/products/${file.filename}`,
    url: `${req.protocol}://${req.get('host')}/uploads/products/${file.filename}`
  }));

  res.json({
    success: true,
    data: files
  });
});

module.exports = router;



