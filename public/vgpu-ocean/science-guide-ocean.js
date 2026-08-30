/* Cognistration science guide ocean: vgpu 0.3.1, validated from the checked-in WGSL sources. */
import { clock, compute, draw, effect, frame, frameLoop, geometry, init, sampler, storage, surface, target } from 'https://esm.sh/vgpu@0.3.1?bundle';
import { orbitControls, perspectiveCamera, sphere } from 'https://esm.sh/vgpu@0.3.1/scene?bundle';

const SHADERS = {"bake":"// Bake the compute buffer into a texture that the vertex shader can sample.\n\nconst _vgsl_bebf7145__NU: u32 = 256u;\n\n@group(0) @binding(0) var<storage, read> disp: array<vec4f>;\n\n@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\n  let x = min(u32(uv.x * f32(_vgsl_bebf7145__NU)), _vgsl_bebf7145__NU - 1u);\n  let z = min(u32(uv.y * f32(_vgsl_bebf7145__NU)), _vgsl_bebf7145__NU - 1u);\n  return disp[z * _vgsl_bebf7145__NU + x];\n}\n","composite":"// Tone-map the HDR scene to the canvas.\n\n@group(0) @binding(0) var src: texture_2d<f32>;\n@group(0) @binding(1) var samp: sampler;\n\nfn _vgsl_7cecec0a__aces(x: vec3f) -> vec3f {\n  let a = 2.51;\n  let b = 0.03;\n  let c = 2.43;\n  let d = 0.59;\n  let e = 0.14;\n  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), vec3f(0.0), vec3f(1.0));\n}\n\nconst _vgsl_7cecec0a__EXPOSURE = 0.62;\n\n@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\n  let hdr = textureSampleLevel(src, samp, uv, 0.0).rgb * _vgsl_7cecec0a__EXPOSURE;\n  var col = pow(_vgsl_7cecec0a__aces(hdr), vec3f(1.0 / 2.2));\n\n  col = (col - 0.5) * 1.07 + 0.5;\n  col *= vec3f(1.05, 1.0, 0.95);\n  let d = uv - vec2f(0.5);\n  col *= 1.0 - 0.28 * dot(d, d);\n\n  return vec4f(clamp(col, vec3f(0.0), vec3f(1.0)), 1.0);\n}\n","fftRow":"// Pass 1: one inverse transform per row.\n\n      \n     \n\n@group(0) @binding(0) var<storage, read> inX: array<vec2f>;\n@group(0) @binding(1) var<storage, read> inY: array<vec2f>;\n@group(0) @binding(2) var<storage, read> inZ: array<vec2f>;\n@group(0) @binding(3) var<storage, read_write> outX: array<vec2f>;\n@group(0) @binding(4) var<storage, read_write> outY: array<vec2f>;\n@group(0) @binding(5) var<storage, read_write> outZ: array<vec2f>;\n\nvar<workgroup> _vgsl_ce808c34__shX: array<vec2f, 256>;\nvar<workgroup> _vgsl_ce808c34__shY: array<vec2f, 256>;\nvar<workgroup> _vgsl_ce808c34__shZ: array<vec2f, 256>;\n\n@compute @workgroup_size(128)\nfn fftRow(\n  @builtin(workgroup_id) wid: vec3u,\n  @builtin(local_invocation_id) lid: vec3u,\n) {\n  let base = wid.x * _vgsl_481c46a4__N;\n  let t = lid.x;\n  let i0 = t;\n  let i1 = t + 128u;\n\n  let r0 = _vgsl_ace9ca63__bitrev(i0);\n  let r1 = _vgsl_ace9ca63__bitrev(i1);\n  _vgsl_ce808c34__shX[r0] = inX[base + i0];\n  _vgsl_ce808c34__shY[r0] = inY[base + i0];\n  _vgsl_ce808c34__shZ[r0] = inZ[base + i0];\n  _vgsl_ce808c34__shX[r1] = inX[base + i1];\n  _vgsl_ce808c34__shY[r1] = inY[base + i1];\n  _vgsl_ce808c34__shZ[r1] = inZ[base + i1];\n  workgroupBarrier();\n\n  _vgsl_ace9ca63__fftStages3(&_vgsl_ce808c34__shX, &_vgsl_ce808c34__shY, &_vgsl_ce808c34__shZ, t);\n\n  let norm = 1.0 / f32(_vgsl_481c46a4__N);\n  outX[base + i0] = _vgsl_ce808c34__shX[i0] * norm;\n  outY[base + i0] = _vgsl_ce808c34__shY[i0] * norm;\n  outZ[base + i0] = _vgsl_ce808c34__shZ[i0] * norm;\n  outX[base + i1] = _vgsl_ce808c34__shX[i1] * norm;\n  outY[base + i1] = _vgsl_ce808c34__shY[i1] * norm;\n  outZ[base + i1] = _vgsl_ce808c34__shZ[i1] * norm;\n}\n\nfn _vgsl_ace9ca63__cmul(a: vec2f, b: vec2f) -> vec2f {\n  return vec2f(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);\n}\n\nfn _vgsl_ace9ca63__bitrev(i: u32) -> u32 {\n  return reverseBits(i) >> (32u - _vgsl_481c46a4__LOG2N);\n}\n\n// Run one 256-point inverse FFT over three displacement fields.\nfn _vgsl_ace9ca63__fftStages3(\n  a: ptr<workgroup, array<vec2f, 256>>,\n  b: ptr<workgroup, array<vec2f, 256>>,\n  c: ptr<workgroup, array<vec2f, 256>>,\n  lid: u32,\n) {\n  for (var s: u32 = 0u; s < _vgsl_481c46a4__LOG2N; s = s + 1u) {\n    let half = 1u << s;\n    let m = half << 1u;\n    if (lid < 128u) {\n      let k = lid & (half - 1u);\n      let base = (lid >> s) << (s + 1u);\n      let i0 = base + k;\n      let i1 = i0 + half;\n      let ang = _vgsl_481c46a4__TWO_PI * f32(k) / f32(m);\n      let w = vec2f(cos(ang), sin(ang));\n\n      let a0 = (*a)[i0];\n      let a1 = _vgsl_ace9ca63__cmul(w, (*a)[i1]);\n      (*a)[i0] = a0 + a1;\n      (*a)[i1] = a0 - a1;\n      let b0 = (*b)[i0];\n      let b1 = _vgsl_ace9ca63__cmul(w, (*b)[i1]);\n      (*b)[i0] = b0 + b1;\n      (*b)[i1] = b0 - b1;\n      let c0 = (*c)[i0];\n      let c1 = _vgsl_ace9ca63__cmul(w, (*c)[i1]);\n      (*c)[i0] = c0 + c1;\n      (*c)[i1] = c0 - c1;\n    }\n    workgroupBarrier();\n  }\n}\n\nconst _vgsl_481c46a4__TWO_PI: f32 = 6.28318530718;\nconst _vgsl_481c46a4__N: u32 = 256u;\nconst _vgsl_481c46a4__LOG2N: u32 = 8u;\n\n\n\n","fftCol":"// Pass 2: transform each column and write spatial displacement.\n\n      \n     \n\n@group(0) @binding(0) var<storage, read> inX: array<vec2f>;\n@group(0) @binding(1) var<storage, read> inY: array<vec2f>;\n@group(0) @binding(2) var<storage, read> inZ: array<vec2f>;\n@group(0) @binding(3) var<storage, read_write> disp: array<vec4f>;\n\nvar<workgroup> _vgsl_2754c922__shX: array<vec2f, 256>;\nvar<workgroup> _vgsl_2754c922__shY: array<vec2f, 256>;\nvar<workgroup> _vgsl_2754c922__shZ: array<vec2f, 256>;\n\nfn _vgsl_2754c922__writeRow(colx: u32, row: u32, norm: f32) {\n  let sign = select(1.0, -1.0, ((colx + row) & 1u) == 1u);\n  let s = norm * sign;\n  disp[row * _vgsl_481c46a4__N + colx] = vec4f(_vgsl_2754c922__shX[row].x * s, _vgsl_2754c922__shY[row].x * s, _vgsl_2754c922__shZ[row].x * s, 0.0);\n}\n\n@compute @workgroup_size(128)\nfn fftCol(\n  @builtin(workgroup_id) wid: vec3u,\n  @builtin(local_invocation_id) lid: vec3u,\n) {\n  let colx = wid.x;\n  let t = lid.x;\n  let z0 = t;\n  let z1 = t + 128u;\n\n  let r0 = _vgsl_ace9ca63__bitrev(z0);\n  let r1 = _vgsl_ace9ca63__bitrev(z1);\n  _vgsl_2754c922__shX[r0] = inX[z0 * _vgsl_481c46a4__N + colx];\n  _vgsl_2754c922__shY[r0] = inY[z0 * _vgsl_481c46a4__N + colx];\n  _vgsl_2754c922__shZ[r0] = inZ[z0 * _vgsl_481c46a4__N + colx];\n  _vgsl_2754c922__shX[r1] = inX[z1 * _vgsl_481c46a4__N + colx];\n  _vgsl_2754c922__shY[r1] = inY[z1 * _vgsl_481c46a4__N + colx];\n  _vgsl_2754c922__shZ[r1] = inZ[z1 * _vgsl_481c46a4__N + colx];\n  workgroupBarrier();\n\n  _vgsl_ace9ca63__fftStages3(&_vgsl_2754c922__shX, &_vgsl_2754c922__shY, &_vgsl_2754c922__shZ, t);\n\n  let norm = 1.0 / f32(_vgsl_481c46a4__N);\n  _vgsl_2754c922__writeRow(colx, z0, norm);\n  _vgsl_2754c922__writeRow(colx, z1, norm);\n}\n\nfn _vgsl_ace9ca63__cmul(a: vec2f, b: vec2f) -> vec2f {\n  return vec2f(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);\n}\n\nfn _vgsl_ace9ca63__bitrev(i: u32) -> u32 {\n  return reverseBits(i) >> (32u - _vgsl_481c46a4__LOG2N);\n}\n\n// Run one 256-point inverse FFT over three displacement fields.\nfn _vgsl_ace9ca63__fftStages3(\n  a: ptr<workgroup, array<vec2f, 256>>,\n  b: ptr<workgroup, array<vec2f, 256>>,\n  c: ptr<workgroup, array<vec2f, 256>>,\n  lid: u32,\n) {\n  for (var s: u32 = 0u; s < _vgsl_481c46a4__LOG2N; s = s + 1u) {\n    let half = 1u << s;\n    let m = half << 1u;\n    if (lid < 128u) {\n      let k = lid & (half - 1u);\n      let base = (lid >> s) << (s + 1u);\n      let i0 = base + k;\n      let i1 = i0 + half;\n      let ang = _vgsl_481c46a4__TWO_PI * f32(k) / f32(m);\n      let w = vec2f(cos(ang), sin(ang));\n\n      let a0 = (*a)[i0];\n      let a1 = _vgsl_ace9ca63__cmul(w, (*a)[i1]);\n      (*a)[i0] = a0 + a1;\n      (*a)[i1] = a0 - a1;\n      let b0 = (*b)[i0];\n      let b1 = _vgsl_ace9ca63__cmul(w, (*b)[i1]);\n      (*b)[i0] = b0 + b1;\n      (*b)[i1] = b0 - b1;\n      let c0 = (*c)[i0];\n      let c1 = _vgsl_ace9ca63__cmul(w, (*c)[i1]);\n      (*c)[i0] = c0 + c1;\n      (*c)[i1] = c0 - c1;\n    }\n    workgroupBarrier();\n  }\n}\n\nconst _vgsl_481c46a4__TWO_PI: f32 = 6.28318530718;\nconst _vgsl_481c46a4__N: u32 = 256u;\nconst _vgsl_481c46a4__LOG2N: u32 = 8u;\n\n\n\n","spectrumInit":"@group(0) @binding(0) var<storage, read_write> h0: array<vec4f>;\n@group(0) @binding(1) var<uniform> sim: _vgsl_481c46a4__SimParams;\n\nfn _vgsl_ad67fa65__uhash(x: u32) -> u32 {\n  var v = x;\n  v ^= v >> 16u;\n  v *= 0x7feb352du;\n  v ^= v >> 15u;\n  v *= 0x846ca68bu;\n  v ^= v >> 16u;\n  return v;\n}\n\nfn _vgsl_ad67fa65__rand(seed: vec2u, salt: u32) -> f32 {\n  let mixed = sim.seed ^ (seed.x * 1973u) ^ (seed.y * 9277u) ^ (salt * 26699u);\n  let h = _vgsl_ad67fa65__uhash(mixed + 1u);\n  return f32(h) * (1.0 / 4294967296.0);\n}\n\nfn _vgsl_ad67fa65__gauss(seed: vec2u) -> vec2f {\n  let u1 = max(_vgsl_ad67fa65__rand(seed, 0u), 1e-6);\n  let u2 = _vgsl_ad67fa65__rand(seed, 1u);\n  let r = sqrt(-2.0 * log(u1));\n  return vec2f(r * cos(_vgsl_481c46a4__TWO_PI * u2), r * sin(_vgsl_481c46a4__TWO_PI * u2));\n}\n\nfn _vgsl_ad67fa65__phillips(k: vec2f) -> f32 {\n  let kmag = length(k);\n  if (kmag < 1e-4) { return 0.0; }\n  let kmag2 = kmag * kmag;\n  let bigL = sim.windSpeed * sim.windSpeed / _vgsl_481c46a4__GRAVITY;\n  let khat = k / kmag;\n  let kdotw = dot(khat, normalize(sim.windDir));\n\n  var ph = sim.amplitude * exp(-1.0 / (kmag2 * bigL * bigL)) / (kmag2 * kmag2);\n  ph *= kdotw * kdotw;\n  let small = sim.patchSize / 2000.0;\n  ph *= exp(-kmag2 * small * small);\n  if (kdotw < 0.0) { ph *= 0.07; }\n  return ph;\n}\n\n@compute @workgroup_size(8, 8)\nfn init(@builtin(global_invocation_id) gid: vec3u) {\n  let x = gid.x;\n  let z = gid.y;\n  if (x >= _vgsl_481c46a4__N || z >= _vgsl_481c46a4__N) { return; }\n  let idx = z * _vgsl_481c46a4__N + x;\n\n  let nx = f32(i32(x) - i32(_vgsl_481c46a4__N) / 2);\n  let nz = f32(i32(z) - i32(_vgsl_481c46a4__N) / 2);\n  let k = _vgsl_481c46a4__TWO_PI * vec2f(nx, nz) / sim.patchSize;\n\n  let phK = _vgsl_ad67fa65__phillips(k);\n  let phMK = _vgsl_ad67fa65__phillips(-k);\n\n  let h0k = sqrt(phK * 0.5) * _vgsl_ad67fa65__gauss(vec2u(x, z));\n  let mx = (_vgsl_481c46a4__N - x) % _vgsl_481c46a4__N;\n  let mz = (_vgsl_481c46a4__N - z) % _vgsl_481c46a4__N;\n  let h0mk = sqrt(phMK * 0.5) * _vgsl_ad67fa65__gauss(vec2u(mx, mz));\n\n  h0[idx] = vec4f(h0k, vec2f(h0mk.x, -h0mk.y));\n}\n\nconst _vgsl_481c46a4__TWO_PI: f32 = 6.28318530718;\nconst _vgsl_481c46a4__N: u32 = 256u;\n\nconst _vgsl_481c46a4__GRAVITY: f32 = 9.81;\n\nstruct _vgsl_481c46a4__SimParams {\n  windDir: vec2f,\n  windSpeed: f32,\n  amplitude: f32,\n  patchSize: f32,\n  time: f32,\n  seed: u32,\n  _pad: f32,\n}\n","spectrumUpdate":"@group(0) @binding(0) var<storage, read> h0: array<vec4f>;\n@group(0) @binding(1) var<storage, read_write> specX: array<vec2f>;\n@group(0) @binding(2) var<storage, read_write> specY: array<vec2f>;\n@group(0) @binding(3) var<storage, read_write> specZ: array<vec2f>;\n@group(0) @binding(4) var<uniform> sim: _vgsl_481c46a4__SimParams;\n\nfn _vgsl_19ae2960__cmul(a: vec2f, b: vec2f) -> vec2f {\n  return vec2f(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);\n}\n\nfn _vgsl_19ae2960__cexp(theta: f32) -> vec2f {\n  return vec2f(cos(theta), sin(theta));\n}\n\n@compute @workgroup_size(8, 8)\nfn update(@builtin(global_invocation_id) gid: vec3u) {\n  let x = gid.x;\n  let z = gid.y;\n  if (x >= _vgsl_481c46a4__N || z >= _vgsl_481c46a4__N) { return; }\n  let idx = z * _vgsl_481c46a4__N + x;\n\n  let nx = f32(i32(x) - i32(_vgsl_481c46a4__N) / 2);\n  let nz = f32(i32(z) - i32(_vgsl_481c46a4__N) / 2);\n  let k = _vgsl_481c46a4__TWO_PI * vec2f(nx, nz) / sim.patchSize;\n  let kmag = length(k);\n\n  let pair = h0[idx];\n  let ex = pair.xy;\n  let emk = pair.zw;\n\n  let w = sqrt(_vgsl_481c46a4__GRAVITY * kmag);\n  let e = _vgsl_19ae2960__cexp(w * sim.time);\n  let ec = vec2f(e.x, -e.y);\n  let htilde = _vgsl_19ae2960__cmul(ex, e) + _vgsl_19ae2960__cmul(emk, ec);\n\n  specY[idx] = htilde;\n\n  let khat = select(vec2f(0.0), k / kmag, kmag > 1e-6);\n  let nih = vec2f(htilde.y, -htilde.x);\n  specX[idx] = nih * khat.x;\n  specZ[idx] = nih * khat.y;\n}\n\nconst _vgsl_481c46a4__TWO_PI: f32 = 6.28318530718;\nconst _vgsl_481c46a4__N: u32 = 256u;\n\nconst _vgsl_481c46a4__GRAVITY: f32 = 9.81;\n\nstruct _vgsl_481c46a4__SimParams {\n  windDir: vec2f,\n  windSpeed: f32,\n  amplitude: f32,\n  patchSize: f32,\n  time: f32,\n  seed: u32,\n  _pad: f32,\n}\n","skydome":"// An inside-out sphere centered on the camera.\n\n     \n\nstruct _vgsl_317f7a68__Sky {\n  viewProj: mat4x4f,\n  camPos: vec3f,\n  radius: f32,\n  sunDir: vec3f,\n  _pad: f32,\n}\n\n@group(0) @binding(0) var<uniform> u: _vgsl_317f7a68__Sky;\n\nstruct _vgsl_317f7a68__VOut {\n  @builtin(position) clip: vec4f,\n  @location(0) dir: vec3f,\n}\n\n@vertex fn vs_main(@location(0) position: vec3f) -> _vgsl_317f7a68__VOut {\n  var o: _vgsl_317f7a68__VOut;\n  let world = position * u.radius + u.camPos;\n  o.clip = u.viewProj * vec4f(world, 1.0);\n  o.dir = normalize(position);\n  return o;\n}\n\n@fragment fn fs_main(@location(0) dir: vec3f) -> @location(0) vec4f {\n  return vec4f(_vgsl_708c1251__skyColor(dir, u.sunDir), 1.0);\n}\n\n// Shared by the skydome and the water reflection.\nfn _vgsl_708c1251__skyColor(dir: vec3f, sunDir: vec3f) -> vec3f {\n  let d = normalize(dir);\n  let sun = normalize(sunDir);\n\n  let up = clamp(d.y, 0.0, 1.0);\n  let horizon = vec3f(1.15, 0.44, 0.19);\n  let zenith = vec3f(0.05, 0.08, 0.22);\n  var col = mix(horizon, zenith, pow(up, 0.5));\n\n  let band = exp(-abs(d.y) * 7.0);\n  col += vec3f(0.45, 0.15, 0.04) * band;\n  let below = clamp(-d.y, 0.0, 1.0);\n  col = mix(col, vec3f(0.18, 0.08, 0.09), below * 0.75);\n\n  let m = max(dot(d, sun), 0.0);\n  col += vec3f(1.35, 0.62, 0.24) * pow(m, 12.0) * 0.55;\n  col += vec3f(1.5, 0.85, 0.42) * pow(m, 170.0) * 1.5;\n  let disk = smoothstep(0.9993, 0.9997, m);\n  col += vec3f(1.7, 1.05, 0.6) * disk * 4.5;\n\n  return col;\n}\n","oceanSurface":"// Procedural grid displaced by the FFT texture, with per-pixel normals and foam.\n\n     \n\noverride GRID: u32 = 512u;\nconst _vgsl_45d3b7d4__NU: u32 = 256u;\n\nstruct _vgsl_45d3b7d4__Ocean {\n  viewProj: mat4x4f,\n  camPos: vec3f,\n  worldSize: f32,\n  sunDir: vec3f,\n  patchSize: f32,\n  heightScale: f32,\n  choppyScale: f32,\n  foamScale: f32,\n  _pad: f32,\n}\n\n@group(0) @binding(0) var<uniform> u: _vgsl_45d3b7d4__Ocean;\n@group(0) @binding(1) var disp: texture_2d<f32>;\n@group(0) @binding(2) var dispSamp: sampler;\n\nfn _vgsl_45d3b7d4__sampleDisp(uv: vec2f) -> vec3f {\n  return textureSampleLevel(disp, dispSamp, uv, 0.0).xyz;\n}\n\nfn _vgsl_45d3b7d4__scaled(d: vec3f) -> vec3f {\n  return vec3f(d.x * u.choppyScale, d.y * u.heightScale, d.z * u.choppyScale);\n}\n\nstruct _vgsl_45d3b7d4__VOut {\n  @builtin(position) clip: vec4f,\n  @location(0) world: vec3f,\n  @location(1) uv: vec2f,\n}\n\n@vertex fn vs_main(@builtin(vertex_index) vi: u32) -> _vgsl_45d3b7d4__VOut {\n  let cell = vi / 6u;\n  let corner = vi % 6u;\n  let cx = cell % GRID;\n  let cz = cell / GRID;\n\n  var offs = array<vec2u, 6>(\n    vec2u(0u, 0u), vec2u(1u, 0u), vec2u(0u, 1u),\n    vec2u(0u, 1u), vec2u(1u, 0u), vec2u(1u, 1u),\n  );\n  let o = offs[corner];\n  let g = vec2f(f32(cx + o.x), f32(cz + o.y)) / f32(GRID);\n  let base = (g - 0.5) * u.worldSize;\n\n  let uv = base / u.patchSize;\n  let world = vec3f(base.x, 0.0, base.y) + _vgsl_45d3b7d4__scaled(_vgsl_45d3b7d4__sampleDisp(uv));\n\n  var out: _vgsl_45d3b7d4__VOut;\n  out.clip = u.viewProj * vec4f(world, 1.0);\n  out.world = world;\n  out.uv = uv;\n  return out;\n}\n\n@fragment fn fs_main(@location(0) world: vec3f, @location(1) uv: vec2f) -> @location(0) vec4f {\n  let e = 1.0 / f32(_vgsl_45d3b7d4__NU);\n  let dwx = u.patchSize / f32(_vgsl_45d3b7d4__NU);\n\n  let dC = _vgsl_45d3b7d4__sampleDisp(uv);\n  let dX = _vgsl_45d3b7d4__sampleDisp(uv + vec2f(e, 0.0));\n  let dZ = _vgsl_45d3b7d4__sampleDisp(uv + vec2f(0.0, e));\n\n  let tX = vec3f(\n    dwx + (dX.x - dC.x) * u.choppyScale,\n    (dX.y - dC.y) * u.heightScale,\n    (dX.z - dC.z) * u.choppyScale,\n  );\n  let tZ = vec3f(\n    (dZ.x - dC.x) * u.choppyScale,\n    (dZ.y - dC.y) * u.heightScale,\n    dwx + (dZ.z - dC.z) * u.choppyScale,\n  );\n  var n = normalize(cross(tZ, tX));\n  if (n.y < 0.0) { n = -n; }\n\n  let dDxdx = (dX.x - dC.x) * u.choppyScale / dwx;\n  let dDzdz = (dZ.z - dC.z) * u.choppyScale / dwx;\n  let dDxdz = (dZ.x - dC.x) * u.choppyScale / dwx;\n  let dDzdx = (dX.z - dC.z) * u.choppyScale / dwx;\n  let jac = (1.0 + dDxdx) * (1.0 + dDzdz) - dDxdz * dDzdx;\n  let foam = smoothstep(u.foamScale, u.foamScale * 0.35, jac);\n\n  let v = normalize(u.camPos - world);\n  let sun = normalize(u.sunDir);\n  let dist = length(u.camPos - world);\n\n  let r = reflect(-v, n);\n  let refl = _vgsl_708c1251__skyColor(r, u.sunDir);\n  let f0 = 0.02;\n  let fres = f0 + (1.0 - f0) * pow(1.0 - max(dot(n, v), 0.0), 5.0);\n\n  let facing = max(dot(n, v), 0.0);\n  let deep = vec3f(0.002, 0.028, 0.055);\n  let shallow = vec3f(0.03, 0.16, 0.19);\n  var water = mix(deep, shallow, pow(facing, 0.5));\n  let crest = clamp(world.y * 0.06 + 0.35, 0.0, 1.0);\n  let sss = pow(max(dot(v, -sun), 0.0), 3.0) * crest;\n  water += vec3f(0.95, 0.34, 0.14) * sss * 0.8;\n\n  let fresW = mix(0.03, 0.92, fres);\n  var col = mix(water, refl, fresW);\n\n  let h = normalize(sun + v);\n  let spec = pow(max(dot(n, h), 0.0), 600.0);\n  col += vec3f(1.8, 1.1, 0.62) * spec * 4.5;\n\n  col = mix(col, vec3f(0.96, 0.90, 0.84), foam);\n\n  let dir = normalize(world - u.camPos);\n  let horizonCol = _vgsl_708c1251__skyColor(normalize(vec3f(dir.x, 0.04, dir.z)), u.sunDir);\n  let fog = smoothstep(u.worldSize * 0.42, u.worldSize * 0.62, dist);\n  col = mix(col, horizonCol, fog);\n\n  return vec4f(col, 1.0);\n}\n\n// Shared by the skydome and the water reflection.\nfn _vgsl_708c1251__skyColor(dir: vec3f, sunDir: vec3f) -> vec3f {\n  let d = normalize(dir);\n  let sun = normalize(sunDir);\n\n  let up = clamp(d.y, 0.0, 1.0);\n  let horizon = vec3f(1.15, 0.44, 0.19);\n  let zenith = vec3f(0.05, 0.08, 0.22);\n  var col = mix(horizon, zenith, pow(up, 0.5));\n\n  let band = exp(-abs(d.y) * 7.0);\n  col += vec3f(0.45, 0.15, 0.04) * band;\n  let below = clamp(-d.y, 0.0, 1.0);\n  col = mix(col, vec3f(0.18, 0.08, 0.09), below * 0.75);\n\n  let m = max(dot(d, sun), 0.0);\n  col += vec3f(1.35, 0.62, 0.24) * pow(m, 12.0) * 0.55;\n  col += vec3f(1.5, 0.85, 0.42) * pow(m, 170.0) * 1.5;\n  let disk = smoothstep(0.9993, 0.9997, m);\n  col += vec3f(1.7, 1.05, 0.6) * disk * 4.5;\n\n  return col;\n}\n"};

const N = 256;
const COMPLEX_BYTES = N * N * 2 * 4;
const VEC4_BYTES = N * N * 4 * 4;
const GRID = 512;
const WORLD_SIZE = 1000;
const SKY_RADIUS = 6000;
const DEG = Math.PI / 180;
const CLEAR = [0.02, 0.02, 0.04, 1];
const CAMERA = {
  fov: 48,
  near: 1,
  far: 8000,
  position: [0, 24, 128],
  target: [0, 5, 0]
};

function hash32(value) {
  var next = value >>> 0;
  next ^= next >>> 16;
  next = Math.imul(next, 0x7feb352d);
  next ^= next >>> 15;
  next = Math.imul(next, 0x846ca68b);
  next ^= next >>> 16;
  return next >>> 0;
}

function unit(seed, salt) {
  return hash32((seed ^ Math.imul(salt, 0x9e3779b9)) >>> 0) / 0x100000000;
}

function randomSeed() {
  if (window.crypto && window.crypto.getRandomValues) {
    var values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return values[0];
  }
  return Math.floor(Math.random() * 0x100000000) >>> 0;
}

function rounded(value, digits) {
  var factor = Math.pow(10, digits || 0);
  return Math.round(value * factor) / factor;
}

function makeProfile(seed) {
  var normalized = seed >>> 0;
  return {
    seed: normalized,
    label: normalized.toString(16).padStart(8, '0').toUpperCase(),
    windSpeed: rounded(12 + unit(normalized, 1) * 34, 1),
    windAngle: rounded(unit(normalized, 2) * 360),
    amplitude: rounded(1.5 + unit(normalized, 3) * 10.5, 1),
    patchSize: rounded(150 + unit(normalized, 4) * 330),
    heightScale: rounded(20 + unit(normalized, 5) * 42, 1),
    choppyScale: rounded(7 + unit(normalized, 6) * 24, 1),
    foamScale: rounded(0.2 + unit(normalized, 7) * 0.8, 2),
    sunElevation: rounded(4 + unit(normalized, 8) * 28, 1),
    sunAzimuth: rounded(unit(normalized, 9) * 360),
    timeScale: rounded(0.6 + unit(normalized, 10) * 1.2, 2)
  };
}

function publishOceanProfile(profile) {
  window.__cognistrationOceanProfile = profile;
  if (typeof window.dispatchEvent === 'function' && typeof window.CustomEvent === 'function') {
    window.dispatchEvent(new CustomEvent('cognistration:ocean-profile', { detail: profile }));
  }
}

function buildOcean(gpu, size, profile) {
  var resources = new Set();
  function own(resource) {
    resources.add(resource);
    return resource;
  }
  function release(resource) {
    resources.delete(resource);
    resource.destroy();
  }

  var params = Object.assign({}, profile);
  function windDir() {
    var angle = params.windAngle * DEG;
    return [Math.cos(angle), Math.sin(angle)];
  }
  function sunDir() {
    var elevation = params.sunElevation * DEG;
    var azimuth = params.sunAzimuth * DEG;
    return [
      Math.cos(elevation) * Math.cos(azimuth),
      Math.sin(elevation),
      Math.cos(elevation) * Math.sin(azimuth)
    ];
  }
  function simUniform(time) {
    return {
      windDir: windDir(),
      windSpeed: params.windSpeed,
      amplitude: params.amplitude,
      patchSize: params.patchSize,
      time: time,
      seed: params.seed
    };
  }
  function skyUniform(viewProj, camPos, sun) {
    return {
      viewProj: viewProj,
      camPos: camPos,
      radius: SKY_RADIUS,
      sunDir: sun || sunDir()
    };
  }

  var h0 = own(storage(gpu, VEC4_BYTES, 'read-write'));
  var specX = own(storage(gpu, COMPLEX_BYTES, 'read-write'));
  var specY = own(storage(gpu, COMPLEX_BYTES, 'read-write'));
  var specZ = own(storage(gpu, COMPLEX_BYTES, 'read-write'));
  var tmpX = own(storage(gpu, COMPLEX_BYTES, 'read-write'));
  var tmpY = own(storage(gpu, COMPLEX_BYTES, 'read-write'));
  var tmpZ = own(storage(gpu, COMPLEX_BYTES, 'read-write'));
  var displacement = own(storage(gpu, VEC4_BYTES, 'read-write'));

  var initPass = compute(gpu, SHADERS.spectrumInit, { set: { h0: h0, sim: simUniform(0) } });
  var updatePass = compute(gpu, SHADERS.spectrumUpdate, {
    set: { h0: h0, specX: specX, specY: specY, specZ: specZ, sim: simUniform(0) }
  });
  var rowPass = compute(gpu, SHADERS.fftRow, {
    set: { inX: specX, inY: specY, inZ: specZ, outX: tmpX, outY: tmpY, outZ: tmpZ }
  });
  var colPass = compute(gpu, SHADERS.fftCol, {
    set: { inX: tmpX, inY: tmpY, inZ: tmpZ, disp: displacement }
  });

  var displacementTarget = own(target(gpu, { size: [N, N], format: 'rgba16float' }));
  var displacementSampler = sampler(gpu, {
    addressModeU: 'repeat',
    addressModeV: 'repeat',
    minFilter: 'linear',
    magFilter: 'linear'
  });
  var bake = effect(gpu, SHADERS.bake, { set: { disp: displacement } });
  var skyGeometry = own(geometry(gpu, sphere({ radius: 1 })));
  var identity = new Float32Array(16);
  var skydome = draw(gpu, {
    shader: SHADERS.skydome,
    geometry: skyGeometry,
    cull: 'front',
    set: { u: skyUniform(identity, [0, 0, 0]) }
  });
  var ocean = draw(gpu, {
    shader: SHADERS.oceanSurface,
    cull: 'none',
    constants: { GRID: GRID },
    vertices: 6 * GRID * GRID,
    set: {
      u: oceanUniform(identity, [0, 0, 0]),
      disp: displacementTarget,
      dispSamp: displacementSampler
    }
  });
  var hdr = own(target(gpu, {
    size: [size[0], size[1]],
    format: 'rgba16float',
    depth: true
  }));
  var linearSampler = sampler(gpu, { minFilter: 'linear', magFilter: 'linear' });
  var composite = effect(gpu, SHADERS.composite, { set: { src: hdr, samp: linearSampler } });
  var simTime = 0;
  var destroyed = false;

  initPass.set({ sim: simUniform(0) });
  initPass.dispatch(N / 8, N / 8);

  function oceanUniform(viewProj, camPos, sun) {
    return {
      viewProj: viewProj,
      camPos: camPos,
      worldSize: WORLD_SIZE,
      sunDir: sun || sunDir(),
      patchSize: params.patchSize,
      heightScale: params.heightScale,
      choppyScale: params.choppyScale,
      foamScale: params.foamScale
    };
  }

  return {
    get hdr() { return hdr; },
    skydome: skydome,
    ocean: ocean,
    composite: composite,
    clear: CLEAR,
    simulate: function (dt) {
      simTime += dt * params.timeScale;
      updatePass.set({ sim: simUniform(simTime) });
      updatePass.dispatch(N / 8, N / 8);
      rowPass.dispatch(N, 1);
      colPass.dispatch(N, 1);
      bake.draw(displacementTarget);
    },
    updateCamera: function (viewProj, camPos) {
      var position = [camPos[0], camPos[1], camPos[2]];
      var sun = sunDir();
      skydome.set({ u: skyUniform(viewProj, position, sun) });
      ocean.set({ u: oceanUniform(viewProj, position, sun) });
    },
    resize: function (nextSize) {
      if (hdr.size[0] === nextSize[0] && hdr.size[1] === nextSize[1]) return;
      var next = own(target(gpu, {
        size: [nextSize[0], nextSize[1]],
        format: 'rgba16float',
        depth: true
      }));
      composite.set({ src: next, samp: linearSampler });
      var previous = hdr;
      hdr = next;
      release(previous);
    },
    destroy: function () {
      if (destroyed) return;
      destroyed = true;
      var owned = Array.from(resources).reverse();
      resources.clear();
      owned.forEach(function (resource) { resource.destroy(); });
    }
  };
}

var canvas = document.getElementById('ocean-canvas');
var status = document.getElementById('ocean-status');

function setStatus(value) {
  if (status) status.textContent = value;
}

function startOcean() {
  if (!canvas) return Promise.resolve();
  var profile = makeProfile(randomSeed());
  publishOceanProfile(profile);
  if (!navigator.gpu) {
    setStatus('WebGPU unavailable · guide remains readable');
    return Promise.resolve();
  }

  var gpu;
  var output;
  var scene;
  var camera;
  var controls;
  var loop;
  var unsubscribeResize;
  var motion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var motionListener;
  var disposed = false;

  function stopLoop() {
    if (loop) loop.stop();
    loop = undefined;
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    stopLoop();
    if (motion && motionListener) {
      if (motion.removeEventListener) motion.removeEventListener('change', motionListener);
      else if (motion.removeListener) motion.removeListener(motionListener);
    }
    if (unsubscribeResize) unsubscribeResize();
    if (controls) controls.dispose();
    if (scene) scene.destroy();
    if (gpu) gpu.dispose();
  }

  return init().then(function (nextGpu) {
    gpu = nextGpu;
    if (disposed) {
      gpu.dispose();
      return;
    }
    output = surface(gpu, canvas, { dpr: [1, 2] });
    scene = buildOcean(gpu, output.size, profile);
    camera = perspectiveCamera(Object.assign({}, CAMERA, { aspect: output.size[0] / output.size[1] }));
    controls = orbitControls(camera, {
      element: canvas,
      target: CAMERA.target,
      damping: 0.12,
      distance: { min: 20, max: 700 },
      pitch: { min: -0.05, max: 1.35 }
    });

    function resizeScene() {
      if (!scene || !camera || !output) return;
      scene.resize(output.size);
      camera.set({ aspect: output.size[0] / output.size[1] });
    }

    unsubscribeResize = output.onResize(resizeScene);
    var time = clock(gpu);
    function render(currentFrame) {
      if (disposed || !output || !scene || !camera || !controls) return;
      var dt = Math.min(Math.max(time.deltaTime || 0, 0), 0.05);
      controls.update(dt);
      scene.simulate(dt);
      scene.updateCamera(camera.viewProjection, camera.worldPosition);
      currentFrame.pass({ target: scene.hdr, clear: scene.clear }, function (pass) {
        pass.draw(scene.skydome);
        pass.draw(scene.ocean);
      });
      currentFrame.pass(output, scene.composite);
    }

    function startLoop() {
      stopLoop();
      if (motion && motion.matches) frame(gpu, render);
      else loop = frameLoop(gpu, render);
    }

    motionListener = startLoop;
    if (motion && motion.addEventListener) motion.addEventListener('change', motionListener);
    else if (motion && motion.addListener) motion.addListener(motionListener);
    startLoop();
    setStatus('WebGPU live · orbit the surface');
    window.addEventListener('pagehide', dispose, { once: true });
  });
}

startOcean().catch(function (error) {
  setStatus('Ocean fallback · ' + (error && error.message ? error.message : 'initialization failed'));
  console.error('Cognistration science guide ocean failed:', error);
});
