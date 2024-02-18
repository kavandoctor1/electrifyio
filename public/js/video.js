

const videowidth = 320; // We will scale the photo videowidth to this
let videoheight = 0; // This will be computed based on the input stream

// |streaming| indicates whether or not we're currently streaming
// video from the camera. Obviously, we start at false.

let streaming = false;

// The various HTML elements we need to configure or control. These
// will be set by the startup() function.

let video = null;
let canvas = null;
let photo = null;
let startbutton = null;

function showViewLiveResultButton() {
  if (window.self !== window.top) {
    // Ensure that if our document is in a frame, we get the user
    // to first open it in its own tab or window. Otherwise, it
    // won't be able to request permission for camera access.
    document.querySelector(".contentarea").remove();
    const button = document.createElement("button");
    button.textContent = "View live result of the example code above";
    document.body.append(button);
    button.addEventListener("click", () => window.open(location.href));
    return true;
  }
  return false;
}

function startup() {
  if (showViewLiveResultButton()) {
    return;
  }
  video = document.getElementById("video");
  canvas = document.getElementById("canvas");
  photo = document.getElementById("photo");
  startbutton = document.getElementById("startbutton");

  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((stream) => {
      video.srcObject = stream;
      video.play();
    })
    .catch((err) => {
      console.error(`An error occurred: ${err}`);
    });

  video.addEventListener(
    "canplay",
    (ev) => {
      if (!streaming) {
        videoheight = video.videoHeight / (video.videoWidth / videowidth);

        // Firefox currently has a bug where the videoheight can't be read from
        // the video, so we will make assumptions if this happens.

        if (isNaN(videoheight)) {
          videoheight = videowidth / (4 / 3);
        }

        video.setAttribute("width", videowidth);
        video.setAttribute("height", videoheight);
        canvas.setAttribute("width", videowidth);
        canvas.setAttribute("height", videoheight);
        streaming = true;
      }
    },
    false,
  );

  startbutton.addEventListener(
    "click",
    (ev) => {
      takepicture();
      ev.preventDefault();
    },
    false,
  );

  clearphoto();
}

// Fill the photo with an indication that none has been
// captured.

function clearphoto() {
  const context = canvas.getContext("2d");
  context.fillStyle = "#AAA";
  context.fillRect(0, 0, canvas.videowidth, canvas.videoheight);

  const data = canvas.toDataURL("image/png");
  photo.setAttribute("src", data);
}

// Capture a photo by fetching the current contents of the video
// and drawing it into a canvas, then converting that to a PNG
// format data URL. By drawing it on an offscreen canvas and then
// drawing that to the screen, we can change its size and/or apply
// other changes before drawing it.

function takepicture() {
  const context = canvas.getContext("2d");
  if (videowidth && videoheight) {
    canvas.videowidth = videowidth;
    canvas.videoheight = videoheight;
    console.log(videowidth,videoheight);

    context.drawImage(video, 0, 0, videowidth, videoheight);

    const data = canvas.toDataURL("image/png");
    const base64Data = data.replace(/^data:image\/png;base64,/, "");
    socket.emit("makeNFT", base64Data);
    console.log('data', data)
    photo.setAttribute("src", data);

    console.log(videoheight,videowidth)
  } else {
    clearphoto();
  }
}

// Set up our event listener to run the startup process
// once loading is complete.
window.addEventListener("load", startup, false);