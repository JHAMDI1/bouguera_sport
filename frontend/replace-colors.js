const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

let modifiedCount = 0;

walkDir('c:/Users/jawis/OneDrive/Desktop/sahbi/frontend/src', function (filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace text-gray-500 -> text-gray-700
        // Replace text-gray-400 -> text-gray-500 (done after, since we don't want to double replace)

        let newContent = content.replace(/text-gray-500/g, 'text-gray-700');
        newContent = newContent.replace(/text-gray-400/g, 'text-gray-500');

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Modified', filePath);
            modifiedCount++;
        }
    }
});

console.log('Total files modified:', modifiedCount);
