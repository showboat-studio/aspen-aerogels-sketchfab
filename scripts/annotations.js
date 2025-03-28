import { AppState } from './AppState.js';

export const CycleConfig = {
  delay: 5000 // default delay in ms
};

const clearCycleTimeout = () => {
  clearTimeout(AppState.restartTimer);
};

const cycleAnnotations = (api, currentIndex, annLength) => {
  if (!AppState.cycling) return;

  AppState.annotationTransitioning = true;
  AppState.ignoreCameraMovement = true;

  if (currentIndex >= annLength) currentIndex = 0;

  api.gotoAnnotation(currentIndex, { preventCameraMove: false }, (err, index) => {
    console.log(err ? '[EVENT ERROR] Tried to go to annotation:' : '[EVENT] Go to annotation:', index);

    CycleConfig.delay = 45000;
    console.log('[CYCLE] Delay changed to 45000ms');
  });
};

const startCycleTimeout = (api, index, annLength) => {
  clearCycleTimeout();
  AppState.restartTimer = setTimeout(() => {
    console.log('[CYCLE] Restarting annotation cycling', index);
    AppState.cycling = true;
    cycleAnnotations(api, index + 1, annLength);
  }, CycleConfig.delay);
};

export { cycleAnnotations, clearCycleTimeout, startCycleTimeout };
