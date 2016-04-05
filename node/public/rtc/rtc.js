var localVideo;
var remoteVideo;
var peerConnection;
var peerConnectionConfig = {        "iceServers": [
            {
                "url": "stun:turn01.uswest.xirsys.com"
            },
            {
                "username": "e84ebc96-fb0b-11e5-86ed-65978be131e0",
                "url": "turn:turn01.uswest.xirsys.com:443?transport=udp",
                "credential": "e84ebd7c-fb0b-11e5-87e9-873e2343eb75"
            },
            {
                "username": "e84ebc96-fb0b-11e5-86ed-65978be131e0",
                "url": "turn:turn01.uswest.xirsys.com:443?transport=tcp",
                "credential": "e84ebd7c-fb0b-11e5-87e9-873e2343eb75"
            },
            {
                "username": "e84ebc96-fb0b-11e5-86ed-65978be131e0",
                "url": "turn:turn01.uswest.xirsys.com:5349?transport=udp",
                "credential": "e84ebd7c-fb0b-11e5-87e9-873e2343eb75"
            },
            {
                "username": "e84ebc96-fb0b-11e5-86ed-65978be131e0",
                "url": "turn:turn01.uswest.xirsys.com:5349?transport=tcp",
                "credential": "e84ebd7c-fb0b-11e5-87e9-873e2343eb75"
            }
        ]
};






navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

function pageReady() {
    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');

   // serverConnection = new WebSocket('ws://127.0.0.1:3434');
   // serverConnection.onmessage = gotMessageFromServer;

    var constraints = {
        video: true,
        audio: true,
    };

    if(navigator.getUserMedia) {
        navigator.getUserMedia(constraints, getUserMediaSuccess, errorHandler);
    } else {
        alert('Your browser does not support getUserMedia API');
    }
}

function getUserMediaSuccess(stream) {
    localStream = stream;
    localVideo.src = window.URL.createObjectURL(stream);
}

function start(isCaller) {
    peerConnection = new RTCPeerConnection(peerConnectionConfig);
    peerConnection.onicecandidate = gotIceCandidate;
    peerConnection.onaddstream = gotRemoteStream;
    peerConnection.addStream(localStream);

    if(isCaller) {
        peerConnection.createOffer(gotDescription, errorHandler);
    }
}

function gotMessageFromServer(message) {
    if(!peerConnection) start(false);

    var signal = JSON.parse(message.data);
    if(signal.sdp) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp), function() {
            peerConnection.createAnswer(gotDescription, errorHandler);
        }, errorHandler);
    } else if(signal.ice) {
        peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice));
    }
}

function gotIceCandidate(event) {
    if(event.candidate != null) {
     //
        console.log('event.candidate: '+event.candidate);
   //     serverConnection.send(JSON.stringify({'ice': event.candidate}));
    }
}

function gotDescription(description) {
    console.log('got description');
    peerConnection.setLocalDescription(description, function () {
   //
        console.log('description:'+description);
 //       serverConnection.send(JSON.stringify({'sdp': description}));
    }, function() {console.log('set description error')});
}

function gotRemoteStream(event) {
    console.log('got remote stream');
    remoteVideo.src = window.URL.createObjectURL(event.stream);
}

function errorHandler(error) {
    console.log(error);
}