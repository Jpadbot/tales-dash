// Build: bundle src/game.js (+ three@0.160.0, tree-shaken, minified) and inline into index.html.
// Usage: node build.mjs   → writes ./index.html (single self-contained file, no external requests)
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';

const res = await build({
  entryPoints: ['src/game.js'],
  bundle: true, minify: true, format: 'iife', target: 'es2019',
  write: false, legalComments: 'none',
});
const js = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
let html = readFileSync('src/index.html', 'utf8');
html = html.replace(/<script type="importmap">[\s\S]*?<\/script>\s*/, '');
const tag = /<script type="module" src="\.\/game\.js"><\/script>/;
if (!tag.test(html)) throw new Error('src/index.html must contain <script type="module" src="./game.js"></script>');
html = html.replace(tag, () => '<script>/* three.js r160 (MIT) bundled + game code */\n' + js + '</script>');
writeFileSync('index.html', html);
console.log('index.html written:', (html.length / 1024).toFixed(1), 'KB');
