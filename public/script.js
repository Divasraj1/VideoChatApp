const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

const user = prompt("Enter your name");

var peer = new Peer({
  host: '127.0.0.1',
  port: 3030,
  path: '/peerjs',
});

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      console.log('someone call me');
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

const connectToNewUser = (userId, stream) => {
  console.log('I call someone' + userId);
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

peer.on("open", (id) => {
  console.log('my id is' + id);
  socket.emit("join-room", ROOM_ID, id, user);
});

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(video);
  });
};

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
const disconnectBtn = document.querySelector("#disconnect");

muteButton.addEventListener("click",() => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if(enabled){
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background_red");
    muteButton.innerHTML = html;
  }
  else{
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background_red");
    muteButton.innerHTML = html;
  }
})

stopVideo.addEventListener("click",() => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if(enabled){
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background_red");
    stopVideo.innerHTML = html;
  }
  else{
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background_red");
    stopVideo.innerHTML = html;
  }
})

inviteButton.addEventListener("click",() => {
  prompt("Copy this link and send it to people you want to have video call with",
  window.location.href
  );
})

disconnectBtn.addEventListener("click",() => {
  peer.destroy();
  const myVideoElement = document.querySelector("video");
  if(myVideoElement){
    myVideoElement.remove();
  }
  socket.emit("disconnect");
  window.location.href = "https://www.google.com";
})