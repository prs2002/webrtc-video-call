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
  });

server.listen(9000, ()=> {
    console.log(`server listning on port 9000`);
})