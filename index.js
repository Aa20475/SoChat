var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

var users = {}

io.on('connection', (socket) => {

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
  
  socket.on('username',(msg)=>{
    users[socket.id] = msg
    console.log(msg+ " joined the chat!");
    io.emit('username', msg);
  })
  
  socket.on('disconnect', () => {
    console.log(users[socket.id]+' disconnected');
    io.emit('userleft',users[socket.id]+' left the chat!')
  });


});

http.listen(3000, () => {
  console.log('listening on *:3000');
});