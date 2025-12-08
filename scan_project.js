const fs = require('fs');
const path = require('path');

const ignore = ['node_modules', '.git', '.angular', 'dist', '.vscode', 'coverage'];

function printTree(dir, depth = 0) {
    const indent = '  '.repeat(depth);
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        if (ignore.includes(file)) return; // On ignore les dossiers lourds

        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            console.log(`${indent}📁 ${file}`);
            printTree(filePath, depth + 1);
        } else {
            // On affiche seulement les fichiers importants (.ts, .js, .json, .html, .css)
            if (file.match(/\.(ts|js|json|html|scss|css|md)$/)) {
                console.log(`${indent}📄 ${file}`);
            }
        }
    });
}

console.log('--- STRUCTURE DU PROJET DKHOUL ---');
printTree(__dirname);
console.log('----------------------------------');