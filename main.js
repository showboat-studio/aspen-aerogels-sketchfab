import { AppState } from './AppState.js';
import { cycleAnnotations, startCycleTimeout } from './annotations.js';
import { createVideo, removeVideo } from './videoplayer.js';

const iframe = document.getElementById('api-frame');
const uid = '1a14647a028c4783bebe1bdd0edcff8f';

let annotationLength = 4;
let currentAnnotationIndex = 0;
let waitingToForcePlay = true;

const onUserCameraMove = (api) => {
  console.log('[USER ACTION] User moved the camera');
  AppState.cycling = false;
  AppState.ignoreCameraMovement = false;

  handleAnnotationBlur(api, currentAnnotationIndex);
};

const handleAnnotationFocus = (api, index) => {
  console.log('[EVENT] Focused on annotation:', index);
  currentAnnotationIndex = index;

  AppState.ignoreCameraMovement = false;
  startCycleTimeout(api, currentAnnotationIndex, annotationLength);
  createVideo(index, !AppState.cycling); // loop if not cycling
  AppState.cycling = false;

  // Optional: attempt to force play in case autoplay is blocked
  if (waitingToForcePlay && index === 0) {
    setTimeout(() => {
      const video = document.querySelector(`#video-container-0 video`);
      if (video) {
        video.play().then(() => {
          console.log('[VIDEO] First video manually played');
        }).catch((err) => {
          console.warn('[VIDEO] First video failed to play:', err);
        });
      }
      waitingToForcePlay = false;
    }, 500); // give DOM a moment to finish rendering
  }
};

const handleAnnotationBlur = (api, index) => {
  console.log('[EVENT] Closed annotation:', { index, cycling: AppState.cycling });
  removeVideo(index);

  if (AppState.cycling) {
    cycleAnnotations(api, currentAnnotationIndex, annotationLength);
  } else {
    startCycleTimeout(api, currentAnnotationIndex, annotationLength);
  }
};

const handleVideoAnnotationEnded = (api) => (event) => {
  const nextIndex = event.detail?.index;
  console.log('[handleVideoAnnotationEnded] Annotation Video Ended:', nextIndex);
  AppState.cycling = true;
  console.log('[handleVideoAnnotationEnded] Cycling =', AppState.cycling);

  if (AppState.cycling) {
    api.unselectAnnotation((err) => {
      if (!err) {
        console.log('[EVENT] Unselected annotations');
      }
    });
  }

  if (typeof nextIndex === 'number') {
    currentAnnotationIndex = nextIndex + 1;
  }
};


const handleClick = (api) => {
  console.log('[EVENT] Click: user has clicked the iframe');
  AppState.cycling = false;
  startCycleTimeout(api, currentAnnotationIndex, annotationLength);
};

const success = (api) => {
  api.start();

  const videoModal = document.createElement('div');
  videoModal.classList.add('video-modal', 'video-out');
  videoModal.id = 'video-modal';
  document.body.appendChild(videoModal);

  api.addEventListener('viewerready', () => {
    console.log('[SKETCHFAB] Viewer ready');

    api.getAnnotationList((err, annotations) => {
      if (!err) {
        console.log('[ANNOTATIONS] List:', annotations.map((a, i) => ({ [i]: a.name })));
        annotationLength = annotations.length;

        setTimeout(() => {
          cycleAnnotations(api, 0, annotationLength);
        }, 5000);
      }
    });

    api.addEventListener('camerastart', () => {
      console.log('[camerastart] camerastart triggered — ignoreCameraMovement =', AppState.ignoreCameraMovement);
      console.log('[camerastart] Cycling =', AppState.cycling);

      if (AppState.ignoreCameraMovement) {
        console.log('[DEBUG] Ignoring camera movement (from auto transition)');
        return;
      }

      onUserCameraMove(api);
    });

    api.addEventListener('annotationFocus', (index) => handleAnnotationFocus(api, index));
    api.addEventListener('annotationBlur', (index) => handleAnnotationBlur(api, index));
    api.addEventListener('click', () => handleClick(api));
    document.addEventListener('videoAnnotationEnded', handleVideoAnnotationEnded(api));
  });
};

const error = (e) => console.error('[SKETCHFAB ERROR]', e);

console.log('[SKETCHFAB] Initializing Sketchfab client');
const client = new Sketchfab('1.12.1', iframe);

client.init(uid, {
  success,
  error,
  preload: 1,
  //camera: 0, //this would disable the spin animation on load
  autospin: 0,
  ui_hint: 2,
  ui_controls: 1,
  ui_watermark: 0,
  ui_infos: 1,
  autostart: 1,
  annotation: 0
});
