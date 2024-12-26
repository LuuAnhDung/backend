const cloudinary = require('../config/cloudinary');

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Upload the image to Cloudinary
    cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) {
          return res.status(500).json({ message: 'Error uploading image to Cloudinary.', error });
        }

        // Respond with the URL of the uploaded image
        res.status(200).json({
          message: 'Image uploaded successfully!',
          imagePath: result.secure_url,
        });
      }
    ).end(req.file.buffer);  // Send the file buffer to Cloudinary
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while uploading the image.' });
  }
};

const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Upload the PDF to Cloudinary
    cloudinary.uploader.upload_stream(
      { resource_type: 'raw' },
      (error, result) => {
        if (error) {
          return res.status(500).json({ message: 'Error uploading PDF to Cloudinary.', error });
        }

        // Respond with the URL of the uploaded PDF
        res.status(200).json({
          message: 'PDF uploaded successfully!',
          pdfUrl: result.secure_url,
        });
      }
    ).end(req.file.buffer);  // Send the file buffer to Cloudinary
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while uploading the PDF.' });
  }
};

module.exports = {
  uploadImage,
  uploadPDF,
};
