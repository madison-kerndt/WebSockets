const http = require('http');
const express = require('express');

const app = express();

app.use(express.static('public'));

// if user visits root they will also be served index.html

app.get('/', function(req, res){
  // what does __dirname do?
  res.sendFile(__dirname + '/public/index.html');
});

var port = process.env.PORT || 3000;

var server = http.createServer(app)
  .listen(port, function(){
  console.log('Listening on port' + port + '.');
});

var socketIo = require('socket.io');
var io = socketIo(server);

// set up event listner for connection event on the server
io.on('connection', function (socket) {
  console.log('A user has connected.', io.engine.clientsCount);

  io.sockets.emit('userConnection', io.engine.clientsCount);

  socket.emit('statusMessage', 'You have connected.');

  socket.on('message', function (channel, message) {
    if (channel === 'voteCast') {
      votes[socket.id] = message;
      console.log('votes', message);
      socket.emit('voteCount', countVotes(message));
    }
  });

  socket.on('disconnect', function () {
    console.log('A user has disconnected.', io.engine.clientsCount);
    delete votes[socket.id];
    socket.emit('voteCount', countVotes(votes));
    io.sockets.emit('userConnection', io.engine.clientsCount);
  });
});

var votes = {};

// write a better version using lodash
function countVotes(votes) {
  var voteCount = {
    A: 0,
    B: 0,
    C: 0,
    D: 0
  };
  for (var vote in votes){
    voteCount[votes[vote]]++;
  }
  return voteCount;
}



module.exports = server;
