// Builds assets/app.js from src/app.js, then assembles the deployable site in public/ (Vercel's default output directory).
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

rmSync('public', { recursive: true, force: true });
mkdirSync('public');
cpSync('index.html', 'public/index.html');
cpSync('assets', 'public/assets', { recursive: true });
console.log('public/ ready');
