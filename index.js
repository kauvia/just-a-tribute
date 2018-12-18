const express = require("express");
const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http);
const path = require("path");


app.use(express.static('public'))

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});
io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });

});
http.listen(3001, function () {
  console.log('listening on *:3001');
});