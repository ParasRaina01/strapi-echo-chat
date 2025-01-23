// import type { Core } from '@strapi/strapi';
import { Server } from 'socket.io';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    const io = new Server(strapi.server.httpServer, {
      cors: {
        origin: ['http://localhost:5173', 'https://strapi-echo-chat.vercel.app'],
        methods: ["GET", "POST", "OPTIONS"],
        credentials: true,
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'Origin',
          'Accept',
          'Cache-Control',
          'X-Requested-With'
        ]
      },
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000
    });

    io.on('connection', (socket) => {
      console.log('A user connected');

      socket.on('message', (message) => {
        // Echo the message back to the client
        socket.emit('message', message);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });

    strapi.io = io; // store the io instance in strapi
  },
};
