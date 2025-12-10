const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const UPLOADS_DIR = path.join(__dirname, '../src/uploads/images'); // Adjust path based on your structure
// Fallback if the above path is incorrect, try the one from uploadMiddleware.js
const UPLOADS_DIR_ALT = path.join(__dirname, '../uploads/images');

async function getImages(dir) {
    let files = [];
    try {
        files = await readdir(dir);
    } catch (err) {
        console.warn(`Could not read directory ${dir}: ${err.message}`);
        return [];
    }

    const images = [];
    for (const file of files) {
        const filePath = path.join(dir, file);
        if ((await stat(filePath)).isFile()) {
            if (/\.(jpg|jpeg|png)$/i.test(file)) {
                images.push(filePath);
            }
        }
    }
    return images;
}

async function convertImages() {
    let targetDir = UPLOADS_DIR;
    // Check if default directory exists, if not check alt
    if (!fs.existsSync(targetDir)) {
        if (fs.existsSync(UPLOADS_DIR_ALT)) {
            targetDir = UPLOADS_DIR_ALT;
        } else {
            console.error('❌ Uploads directory not found!');
            return;
        }
    }

    console.log(`📂 Scanning directory: ${targetDir}`);
    const images = await getImages(targetDir);
    console.log(`🎯 Found ${images.length} images to convert.`);

    let convertedCount = 0;
    let errorCount = 0;

    for (const imagePath of images) {
        const fileExt = path.extname(imagePath);
        const fileName = path.basename(imagePath, fileExt);
        const newFilePath = path.join(path.dirname(imagePath), `${fileName}.webp`);

        // Skip if webp already exists
        if (fs.existsSync(newFilePath)) {
            console.log(`⏭️  Skipping ${fileName}${fileExt} (WebP already exists)`);
            continue;
        }

        try {
            await sharp(imagePath)
                .webp({ quality: 80 })
                .toFile(newFilePath);

            console.log(`✅ Converted: ${fileName}${fileExt} -> ${fileName}.webp`);
            convertedCount++;

            // Optional: Uncomment to delete original file after successful conversion
            // fs.unlinkSync(imagePath); 
        } catch (err) {
            console.error(`❌ Error converting ${fileName}${fileExt}:`, err.message);
            errorCount++;
        }
    }

    console.log('\n🎉 Conversion Complete!');
    console.log(`✅ Converted: ${convertedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
}

convertImages();
