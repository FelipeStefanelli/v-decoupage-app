import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  if (!io) {
    io = new Server(server);
    
    io.on('connection', (socket) => {
      console.log('Cliente conectado via WebSocket');
      
      socket.on('disconnect', () => {
        console.log('Cliente desconectado');
      });
    });

    console.log('Socket.IO inicializado');
  }
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io não está inicializado');
  }
  return io;
};
