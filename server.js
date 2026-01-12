import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 8080;

// Set custom MIME types before serving static files
express.static.mime.define({
  'application/javascript': ['tsx', 'ts', 'js']
});

// Serve static files from current directory
app.use(express.static(__dirname));

// Catch-all route for SPA behavior
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`FohBoh MGE Server listening on port ${port} at 0.0.0.0`);
});