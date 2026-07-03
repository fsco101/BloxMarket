import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

walk('src', (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        // This regex finds 'http://localhost:5000' but ensures it is NOT already preceded by VITE_API_URL or similar logic
        // For simplicity, let's just replace all instances that are inside template strings and not already part of the fallback
        // The pattern we want to fix is `http://localhost:5000...`
        
        // Let's replace 'http://localhost:5000' with ${import.meta.env.VITE_API_URL || 'http://localhost:5000'}
        // First we will temporary replace the already correct ones so they aren't double replaced
        const correctPattern = "\\$\\{import\\.meta\\.env\\.VITE_API_URL \\|\\| 'http://localhost:5000'\\}";
        const tempToken = "___TEMP_CORRECT_URL___";
        content = content.replace(new RegExp(correctPattern, 'g'), tempToken);
        
        // Now replace the raw ones
        content = content.replace(/http:\/\/localhost:5000/g, "${import.meta.env.VITE_API_URL || 'http://localhost:5000'}");
        
        // Restore the correct ones
        content = content.replace(new RegExp(tempToken, 'g'), "${import.meta.env.VITE_API_URL || 'http://localhost:5000'}");

        // We also need to fix single quotes like 'http://localhost:5000/api' which we did in api.ts, but let's avoid messing up strings that aren't template literals.
        // If it was in a regular string like 'http://localhost:5000...', it becomes '${...}...', which is invalid for regular strings.
        // Actually, VITE_API_URL || 'http://localhost:5000' only works in template literals or as an expression.
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${filePath}`);
        }
    }
});
