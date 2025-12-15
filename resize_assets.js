const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceDir = 'C:\\Users\\DELL\\Desktop\\DKHOUL PROJECT\\frontend\\src\\assets\\images'; // Adjust as needed
const iconsDir = 'C:\\Users\\DELL\\Desktop\\DKHOUL PROJECT\\frontend\\src\\assets\\icons';

const tasks = [
    { file: path.join(sourceDir, 'avatar1.png'), width: 96, height: 96, name: 'avatar1.webp' },
    { file: path.join(sourceDir, 'avatar2.png'), width: 96, height: 96, name: 'avatar2.webp' },
    { file: path.join(sourceDir, 'avatar3.png'), width: 96, height: 96, name: 'avatar3.webp' },
    { file: path.join(iconsDir, 'logo.png'), width: 128, height: 128, name: 'logo.webp' },
    // Category images - resize to ~400px width (keeping aspect ratio)
    { file: path.join(sourceDir, 'connect.png'), width: 400, name: 'connect_small.webp' },
    { file: path.join(sourceDir, 'skills.png'), width: 400, name: 'skills_small.webp' },
    { file: path.join(sourceDir, 'space.png'), width: 400, name: 'space_small.webp' },
    // Default service placeholder
    { file: path.join(sourceDir, 'placeholder-service.png'), width: 400, name: 'placeholder-service_small.webp' }
];

tasks.forEach(task => {
    if (fs.existsSync(task.file)) {
        sharp(task.file)
            .resize({ width: task.width, height: task.height }) // height is optional if only width provided
            .webp({ quality: 80 })
            .toFile(path.join(path.dirname(task.file), task.name))
            .then(info => console.log(`Resized ${task.name}`))
            .catch(err => console.error(`Error resizing ${task.file}:`, err));
    } else {
        console.warn(`File not found: ${task.file}`);
    }
});
