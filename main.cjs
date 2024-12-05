const { app, BrowserWindow } = require('electron');
const next = require('next');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { initSocket } = require('./socket.cjs');

// Configurações do Next.js
const dev = process.env.NODE_ENV !== 'production';
const port = 3000;
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

// Para referenciar o arquivo data.json
const jsonFilePath = path.join(__dirname, 'public', 'data', 'data.json');

nextApp.prepare().then(() => {
  const server = http.createServer((req, res) => {
    nextHandler(req, res);
  });

  // Inicializa o Socket.IO
  const io = initSocket(server);

  // Adiciona monitoramento para o arquivo JSON
  fs.watch(jsonFilePath, (eventType, filename) => {
    if (filename && eventType === 'change') {
      fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Erro ao ler o arquivo JSON:', err);
          return;
        }

        const timecodes = JSON.parse(data);
        console.log('Timecodes atualizados, enviando dados via WebSocket:', timecodes); // Log para garantir que está lendo
        io.emit('updateTimecodes', timecodes); // Enviar os timecodes via WebSocket
      });
    }
  });

  server.listen(port, () => {
    console.log(`> Servidor Next.js rodando em http://localhost:${port}`);
  });

  // Inicializa o Electron quando o servidor Next.js estiver pronto
  app.whenReady().then(() => {
    const createWindow = () => {
      const mainWindow = new BrowserWindow({
        width: 1024,  // Aumentei para melhorar a experiência
        height: 768,
        webPreferences: {
          nodeIntegration: false, // Mantém isolado o Node.js para evitar problemas de segurança
          contextIsolation: true,  // Garante que o contexto do JavaScript seja isolado
          enableRemoteModule: false, // Desativa módulos remotos por segurança
          preload: path.join(__dirname, 'preload.js'),
        },
      });
      //mainWindow.loadURL(`file://${path.join(__dirname, '.next/server/pages/index.html')}`);
      mainWindow.loadURL(`http://localhost:${port}`);

      mainWindow.webContents.openDevTools(); // Abrir DevTools para inspecionar eventos e JS
    };

    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
});
