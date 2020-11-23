var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/static'));



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

var users = {}
var chatHistory = {}

io.on('connection', (socket) => {

  socket.on('chat message', (msg) => {
    io.emit('chat message', {'user':users[socket.id],'msg':msg});
  });

  socket.on('username',(msg)=>{
    users[socket.id] = msg
    console.log(msg+ " joined the chat!");
    io.emit('username', msg);
    var dat = [];
    for(var key in users){
      if(key!=socket.id){
        dat.push(users[key]);
      }
    }
    io.to(socket.id).emit("activeusers",dat);
  })
  
  socket.on('disconnect', () => {
    console.log(users[socket.id]+' disconnected');
    io.emit('userleft',users[socket.id])
    delete users[socket.id]
  });


});

http.listen(3000,"192.168.1.3", () => {
  console.log('listening on *:3000');
});