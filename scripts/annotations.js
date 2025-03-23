const clearCycleTimeout = () => {
  clearTimeout(window.restartTimer);
  console.log('[CYCLE] Clear cycle timeout');
}

const cycleAnnotations = (api, currentIndex, annLength) => {
  console.log('[CYCLE] current cycle index: ', currentIndex);
  if (currentIndex + 1 > annLength) currentIndex = 0;
  api.gotoAnnotation(currentIndex, { preventCameraMove: false }, (err, index) => {
    clearTimeout();
    window.isAutoplay = true;
    console.log(err ? '[EVENT ERROR] gotoAnnotation:' : '[EVENT] gotoAnnotation:', index);
  });
}

const startCycleTimeout = (api, index, annLength, from = 'annotations.js') => {
  clearCycleTimeout();
  window.restartTimer = setTimeout(() => {
    console.log('[CYCLE] Restarting cycle', from);
    cycleAnnotations(api, index + 1, annLength);
  }, 45000)
}

export { cycleAnnotations, clearCycleTimeout, startCycleTimeout };