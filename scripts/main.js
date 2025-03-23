import { cycleAnnotations, startCycleTimeout } from "./annotations.js";
import { createVideo, removeVideo } from "./videoplayer.js";

let iframe = document.getElementById('api-frame');
let uid = '1a14647a028c4783bebe1bdd0edcff8f';

window.restartTimer;
let annotationLength = 4;
let currentAnnotationIndex = 0;

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

    api.addEventListener('annotationFocus', (index) => {
      console.log('[EVENT] annotationFocus:', index);
      currentAnnotationIndex = index;
      createVideo(index);
    });

    document.addEventListener('videoAnnotationEnded', (event) => {
      console.log('[EVENT] videoAnnotationEnded:', event.detail.message);
      api.unselectAnnotation((err) => {
        if (!err) {
          console.log('[EVENT] Unselected annotations');
        }
      });

      currentAnnotationIndex = event.detail.message + 1
    });

    api.addEventListener('annotationBlur', (index) => {
      console.log('[EVENT] annotationBlur:', index);
      removeVideo(index, 'annotationBlur');

      if (window.isAutoplay) {
        cycleAnnotations(api, currentAnnotationIndex, annotationLength);
      } else {
        startCycleTimeout(api, currentAnnotationIndex, annotationLength, 'annotationBlur');
      }
    });

    api.addEventListener('click', () => {
      console.log('[EVENT] click');
      window.isAutoplay = false;
      startCycleTimeout(api, currentAnnotationIndex, annotationLength, 'click');
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
