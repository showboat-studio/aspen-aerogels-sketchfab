import { AppState } from './AppState.js';
import { cycleAnnotations, startCycleTimeout } from './annotations.js';
import { createVideo, removeVideo } from './videoplayer.js';

const iframe = document.getElementById('api-frame');
const uid = '1a14647a028c4783bebe1bdd0edcff8f';

let annotationLength = 4;
let currentAnnotationIndex = 0;
let autoplay = true;

const handleAnnotationFocus = (api, index) => {
  console.log('[EVENT] Focused on annotation:', index);
  currentAnnotationIndex = index;

  startCycleTimeout(api, currentAnnotationIndex, annotationLength);

  createVideo(index, !AppState.cycling, api, annotationLength);
  autoplay = AppState.cycling;
  AppState.cycling = false;
};

const handleAnnotationBlur = (api, index) => {
  console.log('[EVENT] Closed annotation:', {
    index,
    cycling: AppState.cycling,
    autoplay
  });

  removeVideo(index);

  if (autoplay) {
    AppState.cycling = true;
    cycleAnnotations(api, currentAnnotationIndex, annotationLength);
  } else {
    startCycleTimeout(api, currentAnnotationIndex, annotationLength);
  }
};

const handleVideoAnnotationEnded = (api) => (event) => {
  const nextIndex = event.detail?.index;
  console.log('[EVENT] Annotation Video Ended:', nextIndex);

  if (autoplay) {
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
  console.log('[EVENT] Click: user has clicked the iframe:', {
    cycling: AppState.cycling
  });
  autoplay = false;
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
        currentAnnotationIndex = 0;

        cycleAnnotations(api, 0, annotationLength);
      }
    });

    api.addEventListener('camerastart', () => {
      console.log('[EVENT] Camera start: stopping cycle due to user camera move');
      AppState.cycling = false;
      autoplay = false;
      startCycleTimeout(api, currentAnnotationIndex, annotationLength);
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
  camera: 0,
  autospin: 0,
  ui_hint: 2,
  ui_controls: 1,
  ui_watermark: 0,
  ui_infos: 1,
  autostart: 1,
  annotation: 0
});