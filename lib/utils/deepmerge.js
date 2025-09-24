export function deepMerge(target, source) {
  if (!isObject(target)) return cloneValue(source);
  if (!isObject(source)) return cloneValue(source);

  const output = Array.isArray(target) ? [...target] : { ...target };

  Object.keys(source).forEach((key) => {
    const srcVal = source[key];
    const tgtVal = output[key];

    if (Array.isArray(srcVal)) {
      output[key] = [...srcVal];
    } else if (isObject(srcVal) && isObject(tgtVal)) {
      output[key] = deepMerge(tgtVal, srcVal);
    } else if (isObject(srcVal)) {
      output[key] = deepMerge({}, srcVal);
    } else {
      output[key] = cloneValue(srcVal);
    }
  });

  return output;
}

export function cloneValue(value) {
  if (Array.isArray(value)) return value.map(cloneValue);
  if (value && typeof value === 'object') return deepMerge({}, value);
  return value;
}

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}


