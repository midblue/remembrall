exports.msToString = function(ms) {
  ms = parseInt(ms)
  if (ms < 1000) return '0s'
  else if (ms < 1000 * 60) return Math.round(ms / 1000) + 's'
  else if (ms < 1000 * 60 * 60) return Math.round(ms / 1000 / 60) + 'm'
  else if (ms < 1000 * 60 * 60 * 24)
    return Math.round(ms / 1000 / 60 / 60) + 'h'
  else if (ms < 1000 * 60 * 60 * 24 * 30)
    return Math.round(ms / 1000 / 60 / 60 / 24) + 'd'
  else if (ms < 1000 * 60 * 60 * 24 * 30 * 12)
    return Math.round(ms / 1000 / 60 / 60 / 24 / 30) + 'mo'
  else return Math.round(ms / 1000 / 60 / 60 / 24 / 365) + 'y'
}
