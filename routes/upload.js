const express = require('express');
const upload = require('../middleware/upload');
const uploadController = require('../controllers/upload');

const router = express.Router();

// Image upload route
router.post('/image', upload.single('imageFile'), uploadController.uploadImage);

// PDF upload route
router.post('/pdf', upload.single('pdfFile'), uploadController.uploadPDF);

module.exports = router;
