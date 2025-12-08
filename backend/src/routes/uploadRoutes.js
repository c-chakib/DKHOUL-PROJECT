const express = require('express');
const { upload, resizeAndOptimize } = require('../middlewares/uploadMiddleware');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect upload route so only logged in users can upload
router.use(authController.protect);

router.post('/', upload.single('image'), resizeAndOptimize, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
    }

    // If Sharp optimized the file, return URL to the saved file
    if (req.file.optimized && req.file.filename) {
        return res.status(200).json({
            status: 'success',
            url: `/uploads/images/${req.file.filename}`,
            optimized: true
        });
    }

    // Fallback: Convert Buffer to Base64 Data URI (if Sharp failed)
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    res.status(200).json({
        status: 'success',
        url: dataURI
    });
});

module.exports = router;
