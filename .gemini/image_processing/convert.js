const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceDir = 'C:\\Users\\DELL\\Desktop\\DKHOUL PROJECT\\frontend\\src\\assets\\images';
const targetDir = sourceDir;

fs.readdir(sourceDir, (err, files) => {
    if (err) {
        console.error('Could not list the directory.', err);
        process.exit(1);
    }

    files.forEach((file, index) => {
        if (file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')) {
            const inputPath = path.join(sourceDir, file);
            const outputPath = path.join(targetDir, path.parse(file).name + '.webp');

            sharp(inputPath)
                .webp({ quality: 80 })
                .toFile(outputPath)
                .then(info => {
                    console.log(`Converted ${file} to WebP`);
                })
                .catch(err => {
                    console.error(`Error converting ${file}:`, err);
                });
        }
    });
});
