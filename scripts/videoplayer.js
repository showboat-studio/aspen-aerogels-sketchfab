// videoplayer.js
import { AppState } from './AppState.js';

const videos = {
  '0': 'assets/Minimize_Downtime.mp4',
  '1': 'assets/CUI.mp4',
  '2': 'assets/Larger_Drum_Capacity.mp4',
  '3': 'assets/Survive_the_Harshest_Conditions.mp4',
  '4': 'assets/Increase_Liquid_Yield.mp4'
};

const removeVideo = (vidindex) => {
  console.log('[VIDEO] removeVideo:', vidindex);

  const vidContainer = document.getElementById(`video-container-${vidindex}`);
  const videoModal = document.getElementById('video-modal');

  if (!videoModal) return;

  videoModal.classList.remove('video-in');
  videoModal.classList.add('video-out');

  setTimeout(() => {
    if (vidContainer) {
      vidContainer.remove();
    }
  }, 1000);
};

const createVideo = (vidindex, loop) => {
  const file = videos[vidindex];
  if (!file) {
    console.warn('[VIDEO] Invalid video key:', vidindex);
    return;
  }

  console.log('[VIDEO] Showing video:', file);

  const videoModal = document.getElementById('video-modal');
  if (!videoModal) return;

  const videoContainer = document.createElement('div');
  videoContainer.classList.add('video-container');
  videoContainer.id = `video-container-${vidindex}`;

  const video = document.createElement('video');
  video.src = file;
  video.controls = false;
  video.autoplay = true;
  video.loop = loop;
  video.muted = true; // Allow autoplay on page load

  const exitButton = document.createElement('button');
  exitButton.classList.add('exit');
  exitButton.innerHTML = '<span class="exit-text">Close</span><span>&times;</span>';
  exitButton.addEventListener('click', () => removeVideo(vidindex));

  const customEvent = new CustomEvent('videoAnnotationEnded', {
    detail: { index: vidindex }
  });

  video.addEventListener('ended', () => {
    console.log(`[VIDEO] ended: ${file}`);
    document.dispatchEvent(customEvent);
  });

  videoContainer.append(exitButton, video);
  videoModal.appendChild(videoContainer);
  videoModal.classList.remove('video-out');
  videoModal.classList.add('video-in');
};

export { createVideo, removeVideo };
