const fs = require('fs');
const path = require('path');

function replaceInFile(fullPath) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let updated = false;

    const replacements = [
        { from: /MUSICMARKET/g, to: 'CHEZ LE MUSICIEN' },
        { from: /musicmarket\.ci/g, to: 'chezlemusicien.ci' },
        { from: /musicmarket,/g, to: 'chezlemusicien,' },
    ];

    for (let r of replacements) {
        if (content.match(r.from)) {
            content = content.replace(r.from, r.to);
            updated = true;
        }
    }

    if (updated) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated', fullPath);
    }
}

function processDir(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            processDir(fullPath);
        } else if (file.isFile() && fullPath.match(/\.(tsx|ts|css|html|sql)$/)) {
            replaceInFile(fullPath);
        }
    }
}

processDir(path.join(__dirname, '../src'));
processDir(path.join(__dirname, '../supabase'));
