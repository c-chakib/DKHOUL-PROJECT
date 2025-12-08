const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Use memory storage for Sharp processing
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit (larger since we'll compress)
});

/**
 * Middleware to resize and optimize images using Sharp
 * Converts to WebP format for better compression
 */
const resizeAndOptimize = async (req, res, next) => {
    if (!req.file) return next();

    try {
        const filename = `service-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
        const filepath = path.join(uploadDir, filename);

        // Process image with Sharp
        await sharp(req.file.buffer)
            .resize(800, 600, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .toFormat('webp')
            .webp({ quality: 80 })
            .toFile(filepath);

        // Update req.file with new path info
        req.file.filename = filename;
        req.file.path = filepath;
        req.file.optimized = true;

        console.log(`📸 Image optimized: ${filename}`);
        next();
    } catch (error) {
        console.error('Sharp optimization error:', error);
        // Fall back to original behavior if Sharp fails
        next();
    }
};

module.exports = { upload, resizeAndOptimize };
