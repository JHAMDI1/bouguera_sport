const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
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

        // 1. Remove rounded corners (rounded-lg, rounded-xl, etc -> rounded-none)
        let newContent = content.replace(/rounded-(?:sm|md|lg|xl|2xl|3xl|full)(?!\w)/g, 'rounded-none');
        // Replace standalone 'rounded ' with 'rounded-none '
        newContent = newContent.replace(/\brounded\b/g, 'rounded-none');

        // 2. Eradicate soft subtle borders and replace with thick structural borders
        newContent = newContent.replace(/\bborder-gray-100\b/g, 'border-2 border-foreground');
        newContent = newContent.replace(/\bborder-gray-200\b/g, 'border-2 border-foreground');
        newContent = newContent.replace(/\bborder-gray-300\b/g, 'border-2 border-foreground');
        newContent = newContent.replace(/\bborder\b(?!-)/g, 'border-2 border-foreground');

        // 3. Make shadows brutalist (shadow-sm, shadow-md, shadow -> shadow-solid)
        newContent = newContent.replace(/\bshadow-(?:sm|md|lg|xl|2xl|inner)\b/g, 'shadow-[4px_4px_0px_var(--color-foreground)]');
        newContent = newContent.replace(/\bshadow\b(?!-)/g, 'shadow-[4px_4px_0px_var(--color-foreground)]');

        // 4. Transform generic "Tailwind Blue/Indigo" buttons to our Neon/Primary intense palette
        newContent = newContent.replace(/bg-blue-600/g, 'bg-primary text-black');
        newContent = newContent.replace(/bg-indigo-600/g, 'bg-primary text-black');
        newContent = newContent.replace(/hover:bg-blue-700/g, 'hover:bg-primary-hover hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--color-foreground)] transition-all');
        newContent = newContent.replace(/hover:bg-indigo-700/g, 'hover:bg-primary-hover hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--color-foreground)] transition-all');

        // Make texts dynamic
        newContent = newContent.replace(/text-blue-600/g, 'text-primary');
        newContent = newContent.replace(/text-indigo-600/g, 'text-primary');

        // Fix table styles for brutalism (remove basic dividers, add structural borders)
        newContent = newContent.replace(/divide-y divide-gray-200/g, 'divide-y-2 divide-foreground');
        newContent = newContent.replace(/min-w-full divide-y/g, 'min-w-full divide-y-2');

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Modified', filePath);
            modifiedCount++;
        }
    }
});

console.log('Total files modified:', modifiedCount);
