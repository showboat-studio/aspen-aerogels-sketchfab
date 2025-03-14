const videos = {
  '0': 'assets/Increase_Liquid_Yield.mp4',
  '1': 'assets/Minimize_Downtime.mp4',
  '2': 'assets/CUI.mp4',
  '3': 'assets/Survive_the_Harshest_Conditions.mp4',
  '4': 'assets/Larger_Drum_Capacity.mp4'
}

let iframe = document.getElementById('api-frame')
let uid = '46e95ba002394dcd8a9032d34c4b7a96'
let selectedAnnotation;

// TODO: bug; this just keeps creating buttons on top of buttons
const createAnnotationButton = (index) => {
  const button = document.createElement('button');
  button.innerText = 'Play Video'
  button.classList.add('play');
  button.id = `button-${index}`
  button.addEventListener('click', () => createVideo(index));
  document.body.appendChild(button);
}

const removeButton = (index) => {
  console.log('remove button')
  document.body.removeChild(document.getElementById(`button-${index}`))
}

const createVideo = (vidindex) => {
  // Look up video based on annotation index
  // The videos object above contains the mapping
  const file = videos[vidindex];

  console.log('ᗧ···ᗣ···ᗣ·· Showing video: ', file)
  const videoModal = document.createElement('div');
  videoModal.classList.add('video-modal');
  
  const videoContainer = document.createElement('div');
  videoContainer.classList.add('video-container');

  const video = document.createElement('video');
  video.src = file;
  video.controls = true;
  video.autoplay = true;

  const exitButton = document.createElement('button');
  exitButton.classList.add('exit')
  exitButton.innerHTML = `&times;`
  exitButton.addEventListener('click', () => document.body.removeChild(videoModal));

  // Auto exit the video 5 seconds after it ends
  video.addEventListener("ended", function () {
    setTimeout(function () {
      document.body.removeChild(videoContainer);
    }, 5000);
  });

  videoContainer.appendChild(exitButton);
  videoContainer.appendChild(video);
  videoModal.appendChild(videoContainer)
  document.body.appendChild(videoModal);
}

const success = (api) => {
  api.start();
  api.addEventListener('viewerready', () => {
    console.log('ᗧ···ᗣ···ᗣ·· Sketchfab viewer ready');
    
    let originalAnnotations = [];

    // Log all annotations
    api.getAnnotationList((err, annotations) => {
      if (!err) {
        originalAnnotations = [...annotations]
        console.log('ᗧ···ᗣ···ᗣ·· Annotations: ', originalAnnotations.map((a, i) => {
          return { [i]: a.name }
        }))
      }
    });

    api.addEventListener('annotationFocus', (index) => {
      console.log('ᗧ···ᗣ···ᗣ·· Reached annotation: ', index);

      if (selectedAnnotation) {
        removeButton(selectedAnnotation)
      }

      selectedAnnotation = index
      createAnnotationButton(index)
    });
  });
}

const error = (e) => console.error('ᗧ···ᗣ···ᗣ·· Sketchfab viewer error: ', e)

console.log('ᗧ···ᗣ···ᗣ·· Initializing Sketchfab client')
const client = new Sketchfab('1.12.1', iframe);

client.init(uid, {
  success,
  error,
  preload: 1,       // Preloads textures before display
  camera: 0,        // Disables automatic camera animation
  ui_hint: "low",   // Hints at using lower settings for better performance
  autostart: 1,     // Auto-starts the model without user interaction
})