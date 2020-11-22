const express = require("express");
const peer = require("peer");
const app = express();
const path = require("path");
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");
app.use(express.static(path.join(__dirname, "/public")));
app.use("/peer", peer.ExpressPeerServer(app, { proxied: true }));
app.set("view engine", "ejs");
app.get("/", (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
    res.render("room", { roomID: req.params.room });
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomID, userID) => {
        console.log(userID, roomID);
        socket.join(roomID);
        socket.to(roomID).broadcast.emit("user-connected", userID);
        socket.on("disconnected", () => {
            socket.to(roomID).broadcast.emit("user-disconnected", userID);
        });
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT);
