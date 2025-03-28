import { AppState } from './AppState.js';
import { cycleAnnotations, startCycleTimeout } from './annotations.js';
import { createVideo, removeVideo } from './videoplayer.js';

const iframe = document.getElementById('api-frame');
const uid = '7c43cf49d0f44e69abfdb2682f580832';

let annotationLength = 4;
let currentAnnotationIndex = 0;
let timeoutDuration = 5000; // start with 5s timeout

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
  createVideo(index, !AppState.cycling);
  AppState.cycling = false;
  timeoutDuration = 45000; // switch to longer timeout after first annotation
  startCycleTimeout(api, currentAnnotationIndex, annotationLength, timeoutDuration);
};

const handleAnnotationBlur = (api, index) => {
  console.log('[EVENT] Closed annotation:', { index, cycling: AppState.cycling });
  removeVideo(index);

  if (AppState.cycling) {
    cycleAnnotations(api, currentAnnotationIndex, annotationLength);
  } else {
    startCycleTimeout(api, currentAnnotationIndex, annotationLength, timeoutDuration);
  }
};

const handleVideoAnnotationEnded = (api) => (event) => {
  const nextIndex = event.detail?.index;
  console.log('[handleVideoAnnotationEnded] Annotation Video Ended:', nextIndex);
  AppState.cycling = true;

  if (AppState.cycling) {
    api.unselectAnnotation((err) => {
      if (!err) console.log('[EVENT] Unselected annotations');
    });
  }

  if (typeof nextIndex === 'number') {
    currentAnnotationIndex = nextIndex + 1;
  }
};

const handleClick = (api) => {
  console.log('[EVENT] Click: user has clicked the iframe');
  AppState.cycling = false;
  timeoutDuration = 45000;
  startCycleTimeout(api, currentAnnotationIndex, annotationLength, timeoutDuration);
};

const success = (api) => {
  AppState.cycling = false; // start with cycling off

  const videoModal = document.createElement('div');
  videoModal.classList.add('video-modal', 'video-out');
  videoModal.id = 'video-modal';
  document.body.appendChild(videoModal);

  api.addEventListener('viewerready', () => {
    console.log('[SKETCHFAB] Viewer ready');

    api.getAnnotationList((err, annotations) => {
      if (!err) {
        annotationLength = annotations.length;
        startCycleTimeout(api, -1, annotationLength, timeoutDuration);
      }
    });

    api.addEventListener('camerastart', () => {
      if (!AppState.ignoreCameraMovement) onUserCameraMove(api);
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
  autospin: 0,
  ui_hint: 2,
  ui_controls: 1,
  ui_watermark: 0,
  ui_infos: 1,
  autostart: 1,
  annotation: 0
});
