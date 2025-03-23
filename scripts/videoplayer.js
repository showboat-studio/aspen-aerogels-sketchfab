const videos = {
  '0': 'assets/Minimize_Downtime.mp4',
  '1': 'assets/CUI.mp4',
  '2': 'assets/Larger_Drum_Capacity.mp4',
  '3': 'assets/Survive_the_Harshest_Conditions.mp4',
  '4': 'assets/Increase_Liquid_Yield.mp4'
};

const removeVideo = (vidindex) => {
  console.log('[VIDEO] removeVideo: ', vidindex)
  const vidContainer = document.getElementById(`video-container-${vidindex}`);
  const videoModal = document.getElementById(`video-modal`);
  videoModal.classList.remove('video-in');
  videoModal.classList.add('video-out');

  setInterval(() => {
    if (vidContainer) {
      vidContainer.remove();
    }
  }, 1000);
}

const createVideo = (vidindex, loop) => {
  const file = videos[vidindex];
  if (!file) return console.log('[VIDEO] Invalid video key:', vidindex);

  console.log('[VIDEO] Showing video:', file);
  const videoModal = document.getElementById(`video-modal`);
  const videoContainer = document.createElement('div');
  videoContainer.classList.add('video-container');
  videoContainer.id = `video-container-${vidindex}`

  const video = document.createElement('video');
  video.src = file;
  video.controls = false;
  video.autoplay = true;
  video.loop = loop;

  const exitButton = document.createElement('button');
  exitButton.classList.add('exit');
  exitButton.innerHTML = '<span class="exit-text">Close</span><span>&times;</span>';
  exitButton.addEventListener('click', () => removeVideo(vidindex));

  const customEvent = new CustomEvent('videoAnnotationEnded', {
    detail: { message: vidindex }
  })

  video.addEventListener("ended", () => {
    console.log(`[VIDEO] ended: ${file}`)
    document.dispatchEvent(customEvent);
  });

  videoContainer.append(exitButton, video);
  videoModal.appendChild(videoContainer);
  videoModal.classList.remove('video-out');
  videoModal.classList.add('video-in');
};

export { createVideo, removeVideo };