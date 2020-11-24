$(function () {
    //initialise socket
    var socket = io();

    // Username
    var foo = null
    var curr = "home"
    while(!foo)[
      foo = prompt("Username: ")
    ]
    $("#dropdownMenuButton").html(foo)
    socket.emit('username',foo);

    // Signalling
    $('form').on('submit',function(e){
      e.preventDefault(); // prevents page reloading
      socket.emit('chat message', {"group":curr,"msg":$('#m').val()});
      $('#m').val('');
      return false;
    });

    $("#homechatpill").on('click',()=>curr="home");

    // Signal Handling
    socket.on('username', function(msg){
      if(msg!=foo){
        $("#drops").append(
          $("<a>").addClass("dropdown-item").attr('id',msg+"id").text(msg)
        )
        $("#"+msg+"id").on('click',()=>{
          if($("#"+msg+"chat").length==0){
            socket.emit("chatstart",msg);

            $("#"+curr+"chatpill").removeClass("active");
            $("#"+curr+"chatbox").removeClass("active");
      
            //add pill to navbar
            $("#pills-tab").append(
              $('<li>').addClass("nav-item").attr('id',msg+"chat").append(
                '<a class="nav-link active" id="'+msg+'chatpill" data-toggle="pill" href="#'+msg+'chatbox" role="tab" aria-controls="'+msg+'chatbox" aria-selected="true">'+msg+'<span class="close pl-2" id="'+msg+'chatclose">×</span></a>'
              )
            )

            $("#"+msg+"chatpill").on('click',()=>curr=msg);
      
            $("#"+msg+"chatclose").on('click',()=>{
              $("#"+msg+"chat").remove();
              $("#"+msg+"chatbox").remove();
              if(name===curr){
                curr = "home"
                $("#"+curr+"chatpill").addClass("active");
                $("#"+curr+"chatbox").addClass("active");
                $("#"+curr+"chatpill").trigger('click');
              }
              
              socket.emit("chatend",msg);
            });
      
            //add chatbox
            $("#pills-tabContent").append(
              '<div class="tab-pane fade show active" id="'+msg+'chatbox" role="tabpanel" aria-labelledby="'+msg+'chatpill"><div class="row "><div class="col-12"><ul class="list-group list-group-flush pt-5" style="width: 100%;" id="'+msg+'messages"></ul></div></div></div>'
            )
      
            $("#"+msg+"chatpill").trigger("click");
      
            curr = msg;
          }
        })
      }
      $('#messages').prepend(
        $('<li>').addClass("list-group-item").addClass("list-group-item-danger").append(
          $('<i>').text(msg + " joined the chat!")
        )
      )
    });

    socket.on("activeusers",(dat)=>{
      users = dat;
      for(var d in dat){
        $("#drops").append(
          $("<a>").addClass("dropdown-item").attr('id',dat[d]+"id").text(dat[d])
        )

        // private chat handlers
        $("#"+dat[d]+"id").on('click',()=>{
          if($("#"+dat[d]+"chat").length==0){
            socket.emit("chatstart",dat[d]);

            $("#"+curr+"chatpill").removeClass("active");
            $("#"+curr+"chatbox").removeClass("active");

            //add pill to navbar
            $("#pills-tab").append(
              $('<li>').addClass("nav-item").attr('id',dat[d]+"chat").append(
                '<a class="nav-link active" id="'+dat[d]+'chatpill" data-toggle="pill" href="#'+dat[d]+'chatbox" role="tab" aria-controls="'+dat[d]+'chatbox" aria-selected="true">'+dat[d]+'<span class="close pl-2" id="'+dat[d]+'chatclose">×</span></a>'
              )
            )

            $("#"+dat[d]+"chatpill").on('click',()=>curr=dat[d]);

            $("#"+dat[d]+"chatclose").on('click',()=>{
              $("#"+dat[d]+"chat").remove();
              $("#"+dat[d]+"chatbox").remove();
              
              if(name===curr){
                curr = "home"
                $("#"+curr+"chatpill").addClass("active");
                $("#"+curr+"chatbox").addClass("active");
                $("#"+curr+"chatpill").trigger('click');
              }
              socket.emit("chatend",dat[d]);

            });

            //add chatbox
            $("#pills-tabContent").append(
              '<div class="tab-pane fade show active" id="'+dat[d]+'chatbox" role="tabpanel" aria-labelledby="'+dat[d]+'chatpill"><div class="row "><div class="col-12"><ul class="list-group list-group-flush pt-5" style="width: 100%;" id="'+dat[d]+'messages"></ul></div></div></div>'
            )

            $("#"+dat[d]+"chatpill").trigger("click");

            curr = dat[d];
          }
        })
      }
    });

    socket.on('chatstart',(name)=>{
      alert("Chat request from "+name);
      var pcurr = curr;
      $("#"+name+"id").trigger("click");
      $("#"+name+"chatpill").removeClass("active");
      $("#"+name+"chatbox").removeClass("active");
      
      $("#"+pcurr+"chatpill").addClass("active");
      $("#"+pcurr+"chatbox").addClass("active");
      $("#"+pcurr+"chatpill").trigger('click');
    });

    socket.on('chatend',(name)=>{
      console.log(name+" left the chat!");
      console.log("Current tab: "+curr);
      if(name===curr){
        curr = "home"
        $("#"+curr+"chatpill").addClass("active");
        $("#"+curr+"chatbox").addClass("active");
        $("#"+curr+"chatpill").trigger('click');
      }
      $("#"+name+"chat").remove();
      $("#"+name+"chatbox").remove();
      
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
      console.log(msg['msg']['group']);
      if(msg['msg']['group']=="home"){
        $('#messages').prepend($('<li>').addClass("list-group-item").append(
          $('<b>').text(msg['user']+": ")
        ).append(
          $('<i>').text(msg['msg']['msg'])
        ))
      }else{

        $('#'+msg['msg']['group']+'messages').prepend($('<li>').addClass("list-group-item").append(
          $('<b>').text(msg['user']+": ")
        ).append(
          $('<i>').text(msg['msg']['msg'])
        ))
      }
    });
  });