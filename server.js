const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set('view engine','ejs')
app.use(express.static('public'))
const {v4:uuidv4} = require("uuid")
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
const {ExpressPeerServer} = require("peer");
const peerServer = ExpressPeerServer(server,{
    debug: true
});

app.use("/peerjs",peerServer);

app.get('/',(req,res) => {
  // res.send("Hello World")
  res.redirect(`/${uuidv4()}`);
})

app.get('/:room',(req,res) => {
    res.render("room",{roomId: req.params.room})
})

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
      socket.join(roomId);
      setTimeout(()=>{
        socket.to(roomId).broadcast.emit("user-connected", userId);
      }, 1000)
    
    socket.on("disconnect",() => {
        console.log("User Disconnected");
        io.emit("user-disconnected",userId)
    })
});
  });

server.listen(process.env.PORT ||3030);