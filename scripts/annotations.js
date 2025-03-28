import { AppState } from './AppState.js';

const clearCycleTimeout = () => {
  clearTimeout(AppState.restartTimer);
};

const cycleAnnotations = (api, currentIndex, annLength) => {
  console.log('[CYCLE] current cycle index:', currentIndex);

  if (!AppState.cycling) return; // 🛡 safety guard

  AppState.annotationTransitioning = true;
  AppState.ignoreCameraMovement = true; // ✅ THIS is only triggered during auto-cycling

  if (currentIndex >= annLength) currentIndex = 0;

  api.gotoAnnotation(currentIndex, { preventCameraMove: false }, (err, index) => {
    console.log(err ? '[EVENT ERROR] Tried to go to annotation:' : '[EVENT] Go to annotation:', index);

  });
};


const startCycleTimeout = (api, index, annLength) => {
  clearCycleTimeout();
  AppState.restartTimer = setTimeout(() => {
    console.log('[CYCLE] Restarting annotation cycling', index);
    AppState.cycling = true;
    cycleAnnotations(api, index + 1, annLength);
  }, 45000);
};

export { cycleAnnotations, clearCycleTimeout, startCycleTimeout };
