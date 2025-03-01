const videos = {
  '0': 'assets/test.mp4',
  '1': 'assets/test.mp4',
  '2': 'assets/test.mp4'
}

let iframe = document.getElementById('api-frame')
let uid = '598aec0db3a247c784b43e22d59262be'

const createVideo = (vidindex) => {
  // Look up video based on annotation index
  // The videos object above contains the mapping
  const file = videos[vidindex];

  console.log('ᗧ···ᗣ···ᗣ·· Showing video: ', file)
  const videoContainer = document.createElement('div');
  videoContainer.classList.add('video-container');

  const video = document.createElement('video');
  video.src = file;
  video.controls = true;
  video.autoplay = true;

  const exitButton = document.createElement('button');
  exitButton.innerHTML = `&times;`
  exitButton.addEventListener('click', () => document.body.removeChild(videoContainer));

  // Auto exit the video 5 seconds after it ends
  video.addEventListener("ended", function () {
    setTimeout(function () {
      document.body.removeChild(videoContainer);
    }, 5000);
  });

  videoContainer.appendChild(video);
  videoContainer.appendChild(exitButton);
  document.body.appendChild(videoContainer);
}

const success = (api) => {
  api.start();
  api.addEventListener('viewerready', () => {
    console.log('ᗧ···ᗣ···ᗣ·· Sketchfab viewer ready');

    // Log all annotations
    // api.getAnnotationList((err, annotations) => {
    //   if (!err) {
    //     console.log(annotations)
    //   }
    // });

    api.addEventListener('annotationFocus', (index) => {
      console.log('ᗧ···ᗣ···ᗣ·· Reached annotation: ', index);
      createVideo(index)
    });
  });
}

const error = (e) => console.error('ᗧ···ᗣ···ᗣ·· Sketchfab viewer error: ', e)

console.log('ᗧ···ᗣ···ᗣ·· Initializing Sketchfab client')
const client = new Sketchfab('1.12.1', iframe);

client.init(uid, {
  success,
  error
})