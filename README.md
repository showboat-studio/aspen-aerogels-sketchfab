# Aspen Areogels Sketchfab

## Proof of Concept Goals

- [x] Display a Sketchfab model with annotations and animations.
- [x] Once the animation has completed, load a video that plays. Allow the video modal to be closable.
- [x] Must look appropriate at all breakpoints.


Annotation lifecycle:
- goToAnnotation (clear timeout)
- camerastart
- annotationFocus
- camerastop
- videoAnnotationEnded (send blur)
- annotationBlur (if autoplay, goto, else set timeout)

Rules:
- app should autoplay annotation cycle unless interacted with
- upon user interaction, cycle should wait 45 seconds, then resume
    - a user panning around starts and stops the camera, but does not register as click