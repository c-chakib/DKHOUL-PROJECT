const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const uuid = require('uuid');
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

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

/**
 * Middleware to resize and optimize images using Sharp
 * Converts to WebP format and uploads to AWS S3
 */
const resizeAndOptimize = async (req, res, next) => {
    if (!req.file && !req.files) return next();

    try {
        // Helper function to process a single file object
        const processFile = async (file) => {
            const filename = `service-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;

            const buffer = await sharp(file.buffer)
                .resize(800, 600, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .toFormat('webp')
                .webp({ quality: 80 })
                .toBuffer();

            const uploadParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `uploads/images/${filename}`, // Organize in a folder
                Body: buffer,
                ContentType: 'image/webp',
                // ACL: 'public-read' // Optional: if bucket is not public by default
            };

            await s3.send(new PutObjectCommand(uploadParams));

            // Construct the public URL
            // Ensure your bucket policy allows public read for this to work directly
            const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/images/${filename}`;

            file.filename = filename;
            file.location = publicUrl; // Use 'location' to match Multer S3 standard
            file.path = publicUrl;     // Keep 'path' for backward compatibility
            file.mimetype = 'image/webp';
            file.optimized = true;
            console.log(`☁️ Image uploaded to S3: ${publicUrl}`);
        };

        // Handle single file
        if (req.file) {
            await processFile(req.file);
        }

        // Handle multiple files
        if (req.files) {
            if (Array.isArray(req.files)) {
                await Promise.all(req.files.map(file => processFile(file)));
            } else {
                const fileArrays = Object.values(req.files);
                for (const fileArray of fileArrays) {
                    await Promise.all(fileArray.map(file => processFile(file)));
                }
            }
        }

        next();
    } catch (error) {
        console.error('Sharp/S3 optimization error (Falling back to local/base64):', error);
        // Do NOT error out. Let the controller handle the buffer fallback.
        // We set a flag just in case we want to know
        req.file.optimizationFailed = true;
        next();
    }
};

module.exports = { upload, resizeAndOptimize };
