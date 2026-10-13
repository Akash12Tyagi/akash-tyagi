// Builds assets/app.js from src/app.js, then assembles the deployable site in dist/ (Vercel's output directory).
import { build } from 'esbuild';
import { cpSync, rmSync, mkdirSync } from 'node:fs';

await build({
  entryPoints: ['src/app.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  loader: { '.png': 'dataurl' },
  outfile: 'assets/app.js',
  logLevel: 'info',
});

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');
cpSync('index.html', 'dist/index.html');
cpSync('assets', 'dist/assets', { recursive: true });
console.log('dist/ ready');
