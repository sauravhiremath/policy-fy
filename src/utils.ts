function mergeJson(target: any) {
  for (var argi = 1; argi < arguments.length; argi++) {
    var source = arguments[argi];
    for (var key in source) {
      if (!(key in target)) {
        target[key] = [];
      }
      for (var i = 0; i < source[key].length; i++) {
        target[key].push(source[key][i]);
      }
    }
  }
  return target;
}

module.exports = {
  mergeJson,
};
