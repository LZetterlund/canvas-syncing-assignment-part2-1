const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');

const port = process.env.PORT || process.env.NODE_PORT || 3029;

// read the client html file into memory
// __dirnmae in node is the current directory
// (in this case the same folder as the server js file)
const index = fs.readFileSync(`${__dirname}/../client/index.html`);

const onRequest = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const app = http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);

// pass in the http server into socketio and grab the websocket server as io
const io = socketio(app);

const onJoined = (sock) => {
  const socket = sock;

  socket.on('join', () => {
    console.log('User has entered your channel');
    socket.join('room1');
  });
};

const onDrawCall = (sock) => {
  const socket = sock;
  socket.on('draw', (data) => {
    // for some reason it breaks if I do not repackage the data into a new object
    const drawData = {
      time: data.time,
      coords: data.coords,
    };
    socket.broadcast.to('room1').emit('draw', drawData);
  });
};

io.sockets.on('connection', (socket) => {
  onJoined(socket);
  onDrawCall(socket);
});
