import { cycleAnnotations, startCycleTimeout } from "./annotations.js";
import { createVideo, removeVideo } from "./videoplayer.js";

let iframe = document.getElementById('api-frame');
let uid = '1a14647a028c4783bebe1bdd0edcff8f';

window.restartTimer;
let annotationLength = 4;
let currentAnnotationIndex = 0;

window.cycling = true;
let autoplay = true;

const success = (api) => {
  api.start();

  const videoModal = document.createElement('div');
  videoModal.classList.add('video-modal');
  videoModal.classList.add('video-out');
  videoModal.id = "video-modal"
  document.body.appendChild(videoModal);

  api.addEventListener('viewerready', () => {
    console.log('[SKETCHFAB] Viewer ready');

    api.getAnnotationList((err, annotations) => {
      if (!err) {
        console.log('[ANNOTATIONS] List:', annotations.map((a, i) => ({ [i]: a.name })));
        annotationLength = annotations.length;
        cycleAnnotations(api, 0, annotationLength);
      }
    });

    api.addEventListener('camerastart', () => {
      console.log('[EVENT] Camera start');
      autoplay = false;
    });

    api.addEventListener('annotationFocus', (index) => {
      console.log('[EVENT] Focused on annotation:', index);
      currentAnnotationIndex = index;
      createVideo(index, !window.cycling);

      if (window.cycling) {
        autoplay = true;
      }

      window.cycling = false;
    });

    document.addEventListener('videoAnnotationEnded', (event) => {
      console.log('[EVENT] Annotation Video Ended:', event.detail.message);

      if (autoplay) {
        api.unselectAnnotation((err) => {
          if (!err) {
            console.log('[EVENT] Unselected annotations');
          }
        });
      }

      currentAnnotationIndex = event.detail.message + 1
    });

    api.addEventListener('annotationBlur', (index) => {
      console.log('[EVENT] Closed annotation:', {
        index,
        cycling: window.cycling,
        autoplay
      });
      removeVideo(index);

      if (autoplay) {
        window.cycling = true;
        cycleAnnotations(api, currentAnnotationIndex, annotationLength);
      } else {
        startCycleTimeout(api, currentAnnotationIndex, annotationLength);
      }
    });

    api.addEventListener('click', () => {
      console.log('[EVENT] Click: user has clicked the iframe:', {
        cycling: window.cycling,
        autoplay: false,
      });
      autoplay = false;
      startCycleTimeout(api, currentAnnotationIndex, annotationLength);
    });
  });
};

const error = (e) => console.error('[SKETCHFAB ERROR]', e);

// Initialize Sketchfab
console.log('[SKETCHFAB] Initializing Sketchfab client');
const client = new Sketchfab('1.12.1', iframe);

client.init(uid, {
  success,
  error,
  preload: 1,
  camera: 0,
  autospin: 0,
  ui_hint: 2,
  autostart: 1,
  annotation: 0
});
