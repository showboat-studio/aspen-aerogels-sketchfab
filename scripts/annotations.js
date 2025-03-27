// annotations.js
import { AppState } from './AppState.js';

const clearCycleTimeout = () => {
  clearTimeout(AppState.restartTimer);
}

const cycleAnnotations = (api, currentIndex, annLength) => {
  console.log('[CYCLE] current cycle index:', currentIndex);
  if (currentIndex >= annLength) currentIndex = 0;
  api.gotoAnnotation(currentIndex, { preventCameraMove: false }, (err, index) => {
    clearCycleTimeout();
    console.log(err ? '[EVENT ERROR] Tried to go to annotation:' : '[EVENT] Go to annotation:', index);
  });
}

const startCycleTimeout = (api, index, annLength) => {
  clearCycleTimeout();
  AppState.restartTimer = setTimeout(() => {
    console.log('[CYCLE] Restarting annotation cycling', index);
    cycleAnnotations(api, index + 1, annLength);
    AppState.cycling = true;
  }, 45000);
}

export { cycleAnnotations, clearCycleTimeout, startCycleTimeout };