import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let landmarker: FaceLandmarker | null = null;
let initPromise: Promise<FaceLandmarker> | null = null;

async function getLandmarker(): Promise<FaceLandmarker> {
  if (landmarker) return landmarker;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // FilesetResolver loads vision_wasm_internal from the self-hosted public versioned directory (immutable, cached 1 year)
    const filesetResolver = await FilesetResolver.forVisionTasks('/mediapipe/v1/wasm');
    const instance = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: '/mediapipe/v1/models/face_landmarker.task',
        delegate: 'CPU', // Universal support in Web Workers without WebGL context issues
      },
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
      runningMode: 'IMAGE',
      numFaces: 1,
    });
    landmarker = instance;
    return instance;
  })();

  return initPromise;
}

self.onmessage = async (e: MessageEvent) => {
  const { type, id, imageBitmap, imageData, width, height } = e.data || {};

  // Idle-time pre-warmup: fetches WASM & model in background during browser idle
  if (type === 'WARMUP') {
    try {
      await getLandmarker();
      self.postMessage({ type: 'WARMUP_READY' });
    } catch (warmErr) {
      // Warmup failed silently; subsequent DETECT calls will retry or fall back to Option C
    }
    return;
  }

  if (type === 'DETECT') {
    const startTime = performance.now();
    try {
      const lm = await getLandmarker();
      const target: TexImageSource = imageBitmap || imageData;
      const result = lm.detect(target);
      const durationMs = Math.round(performance.now() - startTime);

      if (imageBitmap && typeof imageBitmap.close === 'function') {
        imageBitmap.close();
      }

      if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
        self.postMessage({
          type: 'DETECT_RESULT',
          id,
          success: false,
          landmarksAvailable: false,
          durationMs,
          error: 'No face detected by landmarker model',
        });
        return;
      }

      const landmarks = result.faceLandmarks[0];
      // Landmark 152: Submental vertex (anatomic tip of chin)
      const chin152 = landmarks[152];

      // Iris landmarks (468 = right iris center, 473 = left iris center)
      let eyeXNorm = 0.5;
      let eyeYNorm = 0.4;
      let leftIrisNorm: { x: number; y: number } | null = null;
      let rightIrisNorm: { x: number; y: number } | null = null;

      if (landmarks.length > 473 && landmarks[468] && landmarks[473]) {
        const rightIris = landmarks[468];
        const leftIris = landmarks[473];
        eyeXNorm = (rightIris.x + leftIris.x) / 2;
        eyeYNorm = (rightIris.y + leftIris.y) / 2;
        leftIrisNorm = { x: leftIris.x, y: leftIris.y };
        rightIrisNorm = { x: rightIris.x, y: rightIris.y };
      } else {
        // Fallback to eye corner midpoints: right (33, 133), left (362, 263)
        const rCorner = landmarks[33] && landmarks[133]
          ? { x: (landmarks[33].x + landmarks[133].x) / 2, y: (landmarks[33].y + landmarks[133].y) / 2 }
          : null;
        const lCorner = landmarks[362] && landmarks[263]
          ? { x: (landmarks[362].x + landmarks[263].x) / 2, y: (landmarks[362].y + landmarks[263].y) / 2 }
          : null;
        if (rCorner && lCorner) {
          eyeXNorm = (rCorner.x + lCorner.x) / 2;
          eyeYNorm = (rCorner.y + lCorner.y) / 2;
          leftIrisNorm = lCorner;
          rightIrisNorm = rCorner;
        }
      }

      self.postMessage({
        type: 'DETECT_RESULT',
        id,
        success: true,
        landmarksAvailable: true,
        durationMs,
        chinNorm: { x: chin152.x, y: chin152.y },
        eyeNorm: { x: eyeXNorm, y: eyeYNorm },
        leftIrisNorm,
        rightIrisNorm,
        foreheadNorm: landmarks[10] ? { x: landmarks[10].x, y: landmarks[10].y } : null,
      });
    } catch (err: any) {
      if (imageBitmap && typeof imageBitmap.close === 'function') {
        imageBitmap.close();
      }
      self.postMessage({
        type: 'DETECT_RESULT',
        id,
        success: false,
        landmarksAvailable: false,
        error: err?.message || 'FaceLandmarker error',
      });
    }
  }
};
