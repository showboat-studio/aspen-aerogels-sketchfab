const clearCycleTimeout = () => {
  clearTimeout(window.restartTimer);
}

const cycleAnnotations = (api, currentIndex, annLength) => {
  console.log('[CYCLE] current cycle index: ', currentIndex);
  if (currentIndex + 1 > annLength) currentIndex = 0;
  api.gotoAnnotation(currentIndex, { preventCameraMove: false }, (err, index) => {
    clearTimeout();
    console.log(err ? '[EVENT ERROR] Tried to go to annotation:' : '[EVENT] Go to annotation:', index);
  });
}

const startCycleTimeout = (api, index, annLength) => {
  clearCycleTimeout();
  window.restartTimer = setTimeout(() => {
    console.log('[CYCLE] Restarting annotation cycling');
    cycleAnnotations(api, index + 1, annLength);
    window.cycling = true;
  }, 45000)
}

export { cycleAnnotations, clearCycleTimeout, startCycleTimeout };