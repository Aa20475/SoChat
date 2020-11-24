var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/static'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

var users = {}
var privchats = {}

io.on('connection', (socket) => {

  socket.on('chat message', (msg) => {
    if(msg["group"]=="home"){
      io.emit('chat message', {'user':users[socket.id],'msg':msg});
    }else{
      for(const [key, value] of Object.entries(users)){
        if(value===msg['group']){
          io.to(key).emit('chat message', {'user':users[socket.id],'msg':{"group":users[socket.id],"msg":msg["msg"]}});
          break;
        }
      }
      io.to(socket.id).emit('chat message', {'user':users[socket.id],'msg':msg});
    }
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

  socket.on('chatstart', (msg)=>{
    console.log(users[socket.id]+" started chat with "+msg);
    for(const [key, value] of Object.entries(users)){
      if(value===msg){
        io.to(key).emit("chatstart",users[socket.id]);
        break;
      }
    }
  })

  socket.on('chatend', (msg)=>{
    console.log(users[socket.id]+" ended chat with "+msg);
    for(const [key, value] of Object.entries(users)){
      if(value===msg){
        io.to(key).emit("chatend",users[socket.id]);
        break;
      }
    }
  })

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});