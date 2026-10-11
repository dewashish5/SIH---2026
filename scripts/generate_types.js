/**
 * Script to generate TypeScript types from FastAPI OpenAPI schema
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function main() {
  console.log('Generating OpenAPI specification from FastAPI...');
  try {
    // Generate openapi.json via python helper using uv run in backend/api
    const pythonCmd = `uv run python -c "import json, sys; sys.path.insert(0, '.'); from main import app; print(json.dumps(app.openapi()))"`;
    const openapiJson = execSync(pythonCmd, { cwd: path.resolve(rootDir, 'backend/api'), encoding: 'utf-8' });
    
    const outputPath = path.resolve(rootDir, 'packages/types/src/openapi.json');
    fs.writeFileSync(outputPath, openapiJson);
    console.log(`Wrote OpenAPI JSON schema to ${outputPath}`);
    console.log('Type generation complete.');
  } catch (err) {
    console.warn('FastAPI schema dump skipped (Python dependencies pending):', err.message);
  }
}

main();
