const videos = {
  '0': 'assets/Minimize_Downtime.mp4',
  '1': 'assets/CUI.mp4',
  '2': 'assets/Larger_Drum_Capacity.mp4',
  '3': 'assets/Survive_the_Harshest_Conditions.mp4',
  '4': 'assets/Increase_Liquid_Yield.mp4'
};

let iframe = document.getElementById('api-frame');
let uid = '1a14647a028c4783bebe1bdd0edcff8f';
let annotations = [0, 1, 2, 3, 4]; // Annotation indices
let interactionTimer;
let cycling = false; // Track if cycling is active or paused
let apiInstance = null; // Store API instance globally
let annotationTransitioning = false; // Track annotation-based camera movement

// TODO: bug; this just keeps creating buttons on top of buttons
const createAnnotationButton = (index) => {
  removeButton(); // Ensure only one button exists

  const button = document.createElement('button');
  button.innerText = 'Play Video';
  button.classList.add('play');
  button.id = `button-${index}`;
  button.addEventListener('click', () => createVideo(index));

  document.body.appendChild(button);
};

const removeButton = () => {
  const existingButton = document.querySelector('.play');
  if (existingButton) existingButton.remove();
};

const createVideo = (vidindex) => {
  const file = videos[vidindex];
  if (!file) return console.log('[VIDEO] Invalid video key:', vidindex);

  console.log('[VIDEO] Showing video:', file);
  
  const videoModal = document.createElement('div');
  videoModal.classList.add('video-modal');

  const videoContainer = document.createElement('div');
  videoContainer.classList.add('video-container');

  const video = document.createElement('video');
  video.src = file;
  video.controls = true;
  video.autoplay = true;

  const exitButton = document.createElement('button');
  exitButton.classList.add('exit');
  exitButton.innerHTML = '&times;';
  exitButton.addEventListener('click', () => videoModal.remove());

  video.addEventListener("ended", () => setTimeout(() => videoModal.remove(), 5000));

  videoContainer.append(exitButton, video);
  videoModal.appendChild(videoContainer);
  document.body.appendChild(videoModal);
};

const cycleAnnotations = (api) => {
  let currentIndex = 0;

  const moveToNextAnnotation = () => {
    if (!cycling) return;

    annotationTransitioning = true;

    if (currentIndex >= annotations.length) currentIndex = 0;

    api.gotoAnnotation(annotations[currentIndex], { preventCameraMove: false }, (err, index) => {
      console.log(err ? '[CYCLE ERROR]' : '[CYCLE] Moved to annotation:', index);
    });

    currentIndex++;

    setTimeout(() => { annotationTransitioning = false; }, 2000);
    setTimeout(moveToNextAnnotation, 7000);
  };

  moveToNextAnnotation();
};

// Stop cycling and reset after 45 seconds of no interaction
const stopCyclingAfterInteraction = () => {
  clearTimeout(interactionTimer);
  cycling = false;
  console.log('[INTERACTION] Stopping annotation cycling');

  interactionTimer = setTimeout(() => {
    cycling = true;
    console.log('[INTERACTION] Resuming annotation cycling');
    cycleAnnotations(apiInstance);
  }, 45000);
};

const success = (api) => {
  apiInstance = api;
  api.start();

  api.addEventListener('viewerready', () => {
    console.log('[SKETCHFAB] Viewer ready');
    cycling = true;
    cycleAnnotations(api);

    api.addEventListener('click', () => {
      console.log('[INTERACTION] User clicked inside the iframe');
      stopCyclingAfterInteraction();
    });

    api.addEventListener('camerastart', () => {
      if (!annotationTransitioning) {
        console.log('[INTERACTION] User manually moved the camera');
        stopCyclingAfterInteraction();
      }
    });

    api.getAnnotationList((err, annotations) => {
      if (!err) {
        console.log('[ANNOTATIONS] List:', annotations.map((a, i) => ({ [i]: a.name })));
      }
    });

    api.addEventListener('annotationFocus', (index) => {
      console.log('[ANNOTATION] Focused on annotation:', index);

      api.getAnnotation(index, (err, annotation) => {
        if (!err) {
          console.log(`[ANNOTATION] Info ${index}:`, {
            title: annotation.name || "Untitled",
            position: annotation.position || "N/A",
            rawContent: annotation.content?.raw || "N/A",
            renderedContent: annotation.content?.rendered || "N/A"
          });

          const annotationContainer = document.getElementById('annotation-container');
          if (annotationContainer) {
            annotationContainer.innerHTML = `
              <h3>${annotation.name || "Untitled Annotation"}</h3>
              <p><strong>Position:</strong> ${Array.isArray(annotation.position) ? annotation.position.join(', ') : "N/A"}</p>
              <p><strong>Raw Content:</strong> ${annotation.content?.raw || "N/A"}</p>
              <p>${annotation.content?.rendered || ""}</p>
            `;
          }
        } else {
          console.error("[ANNOTATION ERROR] Failed to fetch annotation content.");
        }
      });

      removeButton();
      createAnnotationButton(index);
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
