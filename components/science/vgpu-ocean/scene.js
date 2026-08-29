import { compute, draw, effect, geometry, sampler, storage, target } from 'vgpu';
import { sphere } from 'vgpu/scene';
import bakeShader from './bake.wgsl';
import compositeWgsl from './composite.wgsl';
import fftColWgsl from './fft-col.wgsl';
import fftRowWgsl from './fft-row.wgsl';
import oceanSurfaceWgsl from './ocean-surface.wgsl';
import skydomeWgsl from './skydome.wgsl';
import spectrumInitWgsl from './spectrum-init.wgsl';
import spectrumUpdateWgsl from './spectrum-update.wgsl';
import { createOceanProfile, DEFAULT_OCEAN_PARAMS } from './ocean-profile';

export const OCEAN_CAMERA = {
  fov: 48,
  near: 1,
  far: 8000,
  position: [0, 24, 128],
  target: [0, 5, 0]
};

const N = 256;
const COMPLEX_BYTES = N * N * 2 * 4;
const VEC4_BYTES = N * N * 4 * 4;
const GRID = 512;
const WORLD_SIZE = 1000;
const SKY_RADIUS = 6000;
const DEG = Math.PI / 180;
const CLEAR = [0.02, 0.02, 0.04, 1];

export function buildOcean(gpu, size, profile = createOceanProfile()) {
  const resources = new Set();
  const own = (resource) => {
    resources.add(resource);
    return resource;
  };
  const release = (resource) => {
    resources.delete(resource);
    resource.destroy();
  };

  try {
    const params = { ...DEFAULT_OCEAN_PARAMS, ...profile };
    const windDir = () => {
      const angle = params.windAngle * DEG;
      return [Math.cos(angle), Math.sin(angle)];
    };
    const sunDir = () => {
      const elevation = params.sunElevation * DEG;
      const azimuth = params.sunAzimuth * DEG;
      return [
        Math.cos(elevation) * Math.cos(azimuth),
        Math.sin(elevation),
        Math.cos(elevation) * Math.sin(azimuth)
      ];
    };
    const simUniform = (time) => ({
      windDir: windDir(),
      windSpeed: params.windSpeed,
      amplitude: params.amplitude,
      patchSize: params.patchSize,
      time,
      seed: params.seed ?? 0
    });
    const skyUniform = (viewProj, camPos, sun = sunDir()) => ({
      viewProj,
      camPos,
      radius: SKY_RADIUS,
      sunDir: sun
    });

    let h0 = own(storage(gpu, VEC4_BYTES, 'read-write'));
    const specX = own(storage(gpu, COMPLEX_BYTES, 'read-write'));
    const specY = own(storage(gpu, COMPLEX_BYTES, 'read-write'));
    const specZ = own(storage(gpu, COMPLEX_BYTES, 'read-write'));
    const tmpX = own(storage(gpu, COMPLEX_BYTES, 'read-write'));
    const tmpY = own(storage(gpu, COMPLEX_BYTES, 'read-write'));
    const tmpZ = own(storage(gpu, COMPLEX_BYTES, 'read-write'));
    const displacement = own(storage(gpu, VEC4_BYTES, 'read-write'));

    const initPass = compute(gpu, spectrumInitWgsl, {
      set: { h0, sim: simUniform(0) }
    });
    const updatePass = compute(gpu, spectrumUpdateWgsl, {
      set: { h0, specX, specY, specZ, sim: simUniform(0) }
    });
    const rowPass = compute(gpu, fftRowWgsl, {
      set: { inX: specX, inY: specY, inZ: specZ, outX: tmpX, outY: tmpY, outZ: tmpZ }
    });
    const colPass = compute(gpu, fftColWgsl, {
      set: { inX: tmpX, inY: tmpY, inZ: tmpZ, disp: displacement }
    });

    const displacementTarget = own(target(gpu, { size: [N, N], format: 'rgba16float' }));
    const displacementSampler = sampler(gpu, {
      addressModeU: 'repeat',
      addressModeV: 'repeat',
      minFilter: 'linear',
      magFilter: 'linear'
    });
    const bake = effect(gpu, bakeShader, { set: { disp: displacement } });

    const skyGeometry = own(geometry(gpu, sphere({ radius: 1 })));
    const identity = new Float32Array(16);
    const skydome = draw(gpu, {
      shader: skydomeWgsl,
      geometry: skyGeometry,
      cull: 'front',
      set: { u: skyUniform(identity, [0, 0, 0]) }
    });
    const ocean = draw(gpu, {
      shader: oceanSurfaceWgsl,
      cull: 'none',
      constants: { GRID },
      vertices: 6 * GRID * GRID,
      set: {
        u: oceanUniform(identity, [0, 0, 0]),
        disp: displacementTarget,
        dispSamp: displacementSampler
      }
    });

    let hdr = own(target(gpu, { size: [size[0], size[1]], format: 'rgba16float', depth: true }));
    const linearSampler = sampler(gpu, { minFilter: 'linear', magFilter: 'linear' });
    const composite = effect(gpu, compositeWgsl, { set: { src: hdr, samp: linearSampler } });
    let simTime = 0;
    let destroyed = false;

    initPass.set({ sim: simUniform(0) });
    initPass.dispatch(N / 8, N / 8);

    return {
      params,
      get hdr() {
        return hdr;
      },
      skydome,
      ocean,
      composite,
      clear: CLEAR,
      rebuildSpectrum(nextProfile) {
        if (nextProfile) Object.assign(params, nextProfile);
        const nextH0 = own(storage(gpu, VEC4_BYTES, 'read-write'));
        try {
          const nextPass = compute(gpu, spectrumInitWgsl, {
            set: { h0: nextH0, sim: simUniform(0) }
          });
          nextPass.dispatch(N / 8, N / 8);
          updatePass.set({ h0: nextH0, sim: simUniform(simTime) });
        } catch (error) {
          rethrow(error, () => release(nextH0));
        }
        const previous = h0;
        h0 = nextH0;
        release(previous);
      },
      simulate(dt) {
        simTime += dt * params.timeScale;
        updatePass.set({ sim: simUniform(simTime) });
        updatePass.dispatch(N / 8, N / 8);
        rowPass.dispatch(N, 1);
        colPass.dispatch(N, 1);
        bake.draw(displacementTarget);
      },
      updateCamera(viewProj, camPos) {
        const position = [camPos[0], camPos[1], camPos[2]];
        const sun = sunDir();
        skydome.set({ u: skyUniform(viewProj, position, sun) });
        ocean.set({ u: oceanUniform(viewProj, position, sun) });
      },
      resize(nextSize) {
        if (hdr.size[0] === nextSize[0] && hdr.size[1] === nextSize[1]) return;
        const next = own(target(gpu, {
          size: [nextSize[0], nextSize[1]],
          format: 'rgba16float',
          depth: true
        }));
        try {
          composite.set({ src: next, samp: linearSampler });
        } catch (error) {
          rethrow(error, () => release(next));
        }
        const previous = hdr;
        hdr = next;
        release(previous);
      },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        const owned = [...resources].reverse();
        resources.clear();
        destroyResources(owned);
      }
    };

    function oceanUniform(viewProj, camPos, sun = sunDir()) {
      return {
        viewProj,
        camPos,
        worldSize: WORLD_SIZE,
        sunDir: sun,
        patchSize: params.patchSize,
        heightScale: params.heightScale,
        choppyScale: params.choppyScale,
        foamScale: params.foamScale
      };
    }
  } catch (error) {
    rethrow(error, () => destroyResources([...resources].reverse()));
  }
}

function destroyResources(resources) {
  const errors = [];
  for (const resource of resources) {
    try {
      resource.destroy();
    } catch (error) {
      errors.push(error);
    }
  }
  if (errors.length) throw errors[0];
}

function rethrow(error, cleanup) {
  try {
    cleanup();
  } catch {
    // Cleanup must not replace the construction, rebuild, or resize error.
  }
  throw error;
}
