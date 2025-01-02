import express from "express";
import http from "http"
import { dirname, join } from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";

const app = express();

const server = http.createServer(app);
const io = new Server(server);
const allusers = {};

const __dirname = dirname(fileURLToPath(import.meta.url))

// exposing public directory to outside world
app.use(express.static("public"));
// Access files in the 'public' folder at URLs like /public/image.jpg


app.get("/",(req,res)=> {
    console.log(__dirname);
    res.sendFile(join(__dirname,'app/index.html'));
})

//handle socket connections
io.on('connection', (socket) => {
    console.log(`a user connected to socket server with id ${socket.id}`);
    socket.on("join-user", username=>{
        console.log(`${username} joined socket connection`)
        allusers[username] = { username, id: socket.id };
        // inform everyone that someone joined
        io.emit("joined", allusers);
    })
    socket.on("offer", ({from, to, offer}) => {
        console.log({from , to, offer });
        io.to(allusers[to].id).emit("offer", {from, to, offer});
    });
    socket.on("answer", ({from, to, answer}) => {
        io.to(allusers[from].id).emit("answer", {from, to, answer});
     });
 
     socket.on("end-call", ({from, to}) => {
         io.to(allusers[to].id).emit("end-call", {from, to});
     });
     socket.on("call-ended", caller => {
        const [from, to] = caller;
        io.to(allusers[from].id).emit("call-ended", caller);
        io.to(allusers[to].id).emit("call-ended", caller);
    })

    socket.on("icecandidate", candidate => {
        console.log({ candidate });
        //broadcast to other peers
        socket.broadcast.emit("icecandidate", candidate);
    });  
  });



server.listen(9000, ()=> {
    console.log(`server listning on port 9000`);
})