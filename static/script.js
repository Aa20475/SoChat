$(function () {
    //initialise socket
    var socket = io();

    // Username
    var foo = null
    while(!foo)[
      foo = prompt("Username: ")
    ]
    $("#dropdownMenuButton").html(foo)
    socket.emit('username',foo);
    if (Notification.permission !== "denied") {
       Notification.requestPermission().then(permission => {
          console.log(permission);
       });
    }

    // Signalling
    $('form').submit(function(e){
      e.preventDefault(); // prevents page reloading
      socket.emit('chat message', $('#m').val());
      $('#m').val('');
      return false;
    });


    // Signal Handling
    socket.on('username', function(msg){
      if(msg!=foo){
        $("#drops").append(
          $("<a>").addClass("dropdown-item").attr('id',msg+"id").attr('href',"#").text(msg)
        )
      }
      $('#messages').prepend(
        $('<li>').addClass("list-group-item").addClass("list-group-item-danger").append(
          $('<i>').text(msg + " joined the chat!")
        )
      )
    });

    socket.on("activeusers",(dat)=>{
      for(var d in dat){
        $("#drops").append(
          $("<a>").addClass("dropdown-item").attr('id',dat[d]+"id").attr('href',"#").text(dat[d])
        )
      }
    });

    socket.on('userleft', function(msg){
      $('#messages').prepend(
        $('<li>').addClass("list-group-item").addClass("list-group-item-danger").append(
          $('<i>').text(msg+' left the chat!')
        )
      )
      $("#"+msg+"id").remove();
    });

    socket.on('chat message', function(msg){
      const notif = new Notification(msg['user']+": "+msg['msg']);
      $('#messages').prepend($('<li>').addClass("list-group-item").append(
        $('<b>').text(msg['user']+": ")
      ).append(
        $('<i>').text(msg['msg'])
      ))
      if(msg['user']!==foo){notif();}
    });
  });