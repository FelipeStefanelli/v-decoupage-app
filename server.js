const { app, BrowserWindow } = require('electron');
const { createServer } = require('node:http');
const next = require('next');
const fs = require('fs');
const path = require('path');
const { initSocket } = require('./socket.cjs');

// Configurações do Next.js
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const nextApp = next({ dev, hostname, port });
const handler = nextApp.getRequestHandler();

// Para substituir __dirname em CommonJS
const jsonFilePath = path.join(__dirname, 'public', 'data', 'data.json');

let mainWindow;

// Função para criar a janela do Electron
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Carrega a URL do servidor Next.js no Electron
  mainWindow.loadURL(`http://localhost:${port}`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Inicializando o servidor Next.js
nextApp.prepare().then(() => {
  const server = createServer((req, res) => {
    handler(req, res); // Handler do Next.js
  });

  // Inicializa o WebSocket
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

  // Iniciar o servidor HTTP do Next.js
  server.listen(port, () => {
    console.log(`> Servidor rodando em http://${hostname}:${port}`);

    // Quando o servidor estiver pronto, inicializar o Electron
    app.whenReady().then(createWindow);

    // Encerrar a aplicação quando todas as janelas forem fechadas
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Recria a janela no macOS se o ícone do dock for clicado
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
});
