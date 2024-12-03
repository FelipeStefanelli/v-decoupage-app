import { createServer } from 'node:http';
import next from 'next';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initSocket } from './socket.js';

// Configurações do Next.js
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Para substituir __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonFilePath = path.join(__dirname, 'public', 'data', 'data.json');

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handler(req, res); // Handler do Next.js
  });

  const io = initSocket(server);

  // Monitorar mudanças no arquivo JSON
  fs.watch(jsonFilePath, (eventType, filename) => {
    if (filename && eventType === 'change') {
      // Ler o novo conteúdo do JSON quando o arquivo for modificado
      fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Erro ao ler o arquivo JSON:', err);
          return;
        }

        const timecodes = JSON.parse(data);
        io.emit('updateTimecodes', timecodes); // Enviar dados atualizados via WebSocket
        console.log('Timecodes atualizados, enviando dados via WebSocket.');
      });
    }
  });

  server.listen(port, () => {
    console.log(`> Servidor rodando em http://${hostname}:${port}`);
  });
});
