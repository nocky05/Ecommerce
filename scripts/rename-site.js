const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            replaceInDir(fullPath);
        } else if (file.isFile() && fullPath.match(/\.(tsx|ts|css|html)$/)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = false;
            
            if (content.includes('MusicMarket')) {
                content = content.replace(/MusicMarket/g, 'Chez le musicien');
                updated = true;
            }
            if (content.includes('Music Market')) {
                // Just in case
                content = content.replace(/Music Market/g, 'Chez le musicien');
                updated = true;
            }
            
            if (updated) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated', fullPath);
            }
        }
    }
}

const targetDir = path.join(__dirname, '../src');
console.log('Scanning', targetDir);
replaceInDir(targetDir);
