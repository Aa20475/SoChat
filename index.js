var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var moment = require('moment');
const {Client} = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
  user: process.env.DBUSERNAME,
  host: process.env.DBHOST,
  database: process.env.DBNAME,
  password: process.env.DBPASS,
  port : 5432,
});

//connecting to db
client.connect().catch((err)=>console.log(err));

client.query(`SELECT EXISTS (
  SELECT 1
  FROM   information_schema.tables 
  WHERE  table_name = 'chats'
  );`,(err,res)=>{
    if(!res['rows'][0]['exists']){
      const query = `
      CREATE TABLE chats (
          time timestamp,
          username varchar,
          message varchar,
          primary key (time)
      );
      `;
      client.query(query, (err, res) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Table is successfully created; '+res);
      });
    }
  })


app.use(express.static(__dirname + '/static'));



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

var users = {}
var chatHistory = {}

io.on('connection', (socket) => {

  socket.on('chat message', (msg) => {
    client.query(`
    INSERT INTO chats (time,username,message)
    VALUES ('`+ moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')+`','`+socket.id+`','`+msg+`');
  `,(err,res)=>{if(err)console.log(err)})
    io.emit('chat message', {'user':users[socket.id],'msg':msg});
  });

  socket.on('username',(msg)=>{
    users[socket.id] = msg
    console.log(msg+ " joined the chat!");

    client.query(`
    INSERT INTO chats (time,username,message)
    VALUES ('`+ moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')+`','`+socket.id+`','Joined chat');
  `,(err,res)=>{if(err)console.log(err)})
  
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

    client.query(`
    INSERT INTO chats (time,username,message)
    VALUES ('`+ moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')+`','`+socket.id+`','Left the chat');
  `,(err,res)=>{if(err)console.log(err)})

    io.emit('userleft',users[socket.id])
    delete users[socket.id]
  });


});

http.listen(3000, () => {
  console.log('listening on *:3000');
});