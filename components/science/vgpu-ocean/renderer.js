import { clock, frame, frameLoop, init, surface } from 'vgpu';
import { orbitControls, perspectiveCamera } from 'vgpu/scene';
import { buildOcean, OCEAN_CAMERA } from './scene';
import { createOceanProfile } from './ocean-profile';

export function createRenderer({ canvas, seed, onReady, onProfileChange, onError }) {
  let disposed = false;
  let gpu;
  let output;
  let scene;
  let camera;
  let controls;
  let loop;
  let unsubscribeResize;
  let motionQuery;
  let motionListener;
  const profile = createOceanProfile(seed);
  onProfileChange?.(profile);

  const stopLoop = () => {
    loop?.stop();
    loop = undefined;
  };

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    stopLoop();
    if (motionQuery && motionListener) {
      if (motionQuery.removeEventListener) motionQuery.removeEventListener('change', motionListener);
      else motionQuery.removeListener?.(motionListener);
    }
    unsubscribeResize?.();
    controls?.dispose();
    scene?.destroy();
    gpu?.dispose();
  };

  const render = (currentFrame, time) => {
    if (disposed || !output || !scene || !camera || !controls) return;
    const dt = Math.min(Math.max(time.deltaTime || 0, 0), 0.05);
    controls.update(dt);
    scene.simulate(dt);
    scene.updateCamera(camera.viewProjection, camera.worldPosition);
    currentFrame.pass({ target: scene.hdr, clear: scene.clear }, (pass) => {
      pass.draw(scene.skydome);
      pass.draw(scene.ocean);
    });
    currentFrame.pass(output, scene.composite);
  };

  const startLoop = (time) => {
    stopLoop();
    if (motionQuery?.matches) {
      frame(gpu, (currentFrame) => render(currentFrame, time));
    } else {
      loop = frameLoop(gpu, (currentFrame) => render(currentFrame, time));
    }
  };

  const initialize = async () => {
    if (!navigator.gpu) throw new Error('WebGPU is not available in this browser.');
    gpu = await init();
    if (disposed) {
      gpu.dispose();
      return;
    }

    output = surface(gpu, canvas, { dpr: [1, 2] });
    scene = buildOcean(gpu, output.size, profile);
    camera = perspectiveCamera({ ...OCEAN_CAMERA, aspect: output.size[0] / output.size[1] });
    controls = orbitControls(camera, {
      element: canvas,
      target: OCEAN_CAMERA.target,
      damping: 0.12,
      distance: { min: 20, max: 700 },
      pitch: { min: -0.05, max: 1.35 }
    });

    const resizeScene = () => {
      if (!scene || !camera || !output) return;
      scene.resize(output.size);
      camera.set({ aspect: output.size[0] / output.size[1] });
    };
    unsubscribeResize = output.onResize(resizeScene);
    motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const time = clock(gpu);
    motionListener = () => startLoop(time);
    if (motionQuery?.addEventListener) motionQuery.addEventListener('change', motionListener);
    else motionQuery?.addListener?.(motionListener);

    startLoop(time);
    onReady?.(profile);
  };

  const ready = initialize().catch((error) => {
    if (!disposed) {
      onError?.(error);
      dispose();
    }
  });

  return { ready, dispose, profile };
}
