const socket = io("/");
const videogrid = document.getElementById("video-grid");
const peer = new Peer(undefined, {
    host: "/",
    port: 3001,
});
const peers = {};
const myvideo = document.createElement("video");
myvideo.muted = true;

//code to open webcam and send the stream to all other users
navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        addVideoStream(myvideo, stream);
        socket.on("user-connected", (userID) => {
            connectToNewUser(userID, stream);
        });
        peer.on("call", (call) => {
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream);
            });
        });
    });

//when user disconnects
socket.on("user-disconnected", (userID) => {
    if (peers[userID]) peers[userID].close();
});

//when peer connects
peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id);
});

//function to add video stream of other user connected
function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
    });
    videogrid.append(video);
}
//function to connect to a new user
function connectToNewUser(userID, stream) {
    const call = peer.call(userID, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });
    call.on("close", () => {
        video.remove();
    });

    peers[userID] = call;
}

//code to start video on webcam
// const video = document.getElementById("video-grid");
// function startVideo() {
//     navigator.getUserMedia(
//         { video: {} },
//         (stream) => (video.srcObject = stream),
//         (err) => console.error(err)
//     );
// }
// console.log(video);
// startVideo();
