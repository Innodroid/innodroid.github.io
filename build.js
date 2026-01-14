const fs = require('fs');
const path = require('path');
const { minify: minifyHtml } = require('html-minifier-terser');
const CleanCSS = require('clean-css');
const { minify: minifyJs } = require('terser');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

// Ensure dist directory exists
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

async function processDirectory(currentSrc, currentDist) {
    if (!fs.existsSync(currentDist)) {
        fs.mkdirSync(currentDist, { recursive: true });
    }

    const entries = fs.readdirSync(currentSrc, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(currentSrc, entry.name);
        const distPath = path.join(currentDist, entry.name);
        const relPath = path.relative(srcDir, srcPath);

        if (entry.isDirectory()) {
            await processDirectory(srcPath, distPath);
            continue;
        }

        const ext = path.extname(entry.name);

        try {
            if (ext === '.html') {
                console.log(`Minifying HTML: ${relPath}`);
                const content = fs.readFileSync(srcPath, 'utf8');
                const minified = await minifyHtml(content, {
                    collapseWhitespace: true,
                    removeComments: true,
                    minifyCSS: true,
                    minifyJS: true
                });
                fs.writeFileSync(distPath, minified);
            } else if (ext === '.css') {
                console.log(`Minifying CSS: ${relPath}`);
                const content = fs.readFileSync(srcPath, 'utf8');
                const output = new CleanCSS().minify(content);
                fs.writeFileSync(distPath, output.styles);
            } else if (ext === '.js') {
                console.log(`Minifying JS: ${relPath}`);
                const content = fs.readFileSync(srcPath, 'utf8');
                const result = await minifyJs(content);
                fs.writeFileSync(distPath, result.code);
            } else {
                console.log(`Copying file: ${relPath}`);
                fs.copyFileSync(srcPath, distPath);
            }
        } catch (err) {
            console.error(`Error processing ${relPath}:`, err);
            // Fallback to copy on error
            fs.copyFileSync(srcPath, distPath);
        }
    }
}

processDirectory(srcDir, distDir).then(() => {
    console.log('Build complete! Files minified to /dist');
}).catch(err => {
    console.error('Build failed:', err);
});
