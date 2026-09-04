import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  // pdfkit (used by @react-pdf/renderer in /api/submit-lead) loads its standard-font files via a
  // require() path Next's bundler can't statically see, so they get dropped from the serverless
  // function bundle on Netlify unless explicitly traced in. Without this, that route throws an
  // unhandled "Cannot find module .../Helvetica.cjs" rejection at runtime — and because Netlify's
  // Next Runtime serves all API routes from one shared function process, that crash can also take
  // down unrelated requests (like the ZIP estimators) sharing the same warm container.
  outputFileTracingIncludes: {
    '/api/submit-lead': ['./node_modules/pdfkit/js/**/*'],
    '/api/submit-lead/**': ['./node_modules/pdfkit/js/**/*'],
  },
};

export default nextConfig;
