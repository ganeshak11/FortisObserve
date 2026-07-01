const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(filePath));
        } else {
            if (filePath.endsWith('.tsx') || filePath.endsWith('.css')) {
                results.push(filePath);
            }
        }
    });
    return results;
}

const files = walk('/home/ganeshak11/dev/fortisobserve/src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace Tailwind classes
    content = content.replace(/slate-/g, 'zinc-');
    content = content.replace(/cyan-900/g, 'violet-900');
    content = content.replace(/cyan-800/g, 'violet-800');
    content = content.replace(/cyan-700/g, 'violet-700');
    content = content.replace(/cyan-600/g, 'violet-600');
    content = content.replace(/cyan-500/g, 'violet-500');
    content = content.replace(/cyan-400/g, 'violet-400');
    content = content.replace(/cyan-300/g, 'violet-300');
    content = content.replace(/emerald-/g, 'amber-');
    
    // Replace hex codes in globals.css
    if (file.endsWith('globals.css')) {
        content = content.replace(/#0f172a/g, '#18181b');
        content = content.replace(/#334155/g, '#3f3f46');
        content = content.replace(/#475569/g, '#52525b');
        content = content.replace(/rgba\(15, 23, 42,/g, 'rgba(24, 24, 27,');
        content = content.replace(/rgba\(51, 65, 85,/g, 'rgba(63, 63, 70,');
    }
    
    // Replace hex codes in CyberGlobe
    if (file.endsWith('CyberGlobe.tsx')) {
        content = content.replace(/#0f172a/g, '#18181b');
        content = content.replace(/#06b6d4/g, '#8b5cf6');
        content = content.replace(/'#22d3ee', '#10b981', '#a855f7'/g, "'#a855f7', '#8b5cf6', '#fbbf24'");
    }
    
    fs.writeFileSync(file, content, 'utf8');
});

console.log('Recoloring complete!');
