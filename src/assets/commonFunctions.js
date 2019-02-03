const keys = require('../../keys.js')

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

exports.findImagesForKeyword = function(keyword, count) {
  const urlBase = `https://www.googleapis.com/customsearch/v1?imgSize=large&imgType=photo&searchType=image&key=${
    keys.GOOGLE
  }&cx=${keys.GSEARCH}`
  const query = encodeURI(keyword)
  return new Promise(resolve => {
    fetch(`${urlBase}&q=${query}&num=${count}`)
      .then(res => res.json())
      .then(json => {
        if (!json.items) resolve([])
        else resolve(json.items.map(image => image.link))
      })
  })
}

exports.getKeyWord = function(text) {
  return text
    .replace(/\(.*\)/g, '')
    .toLowerCase()
    .split(/[ /;.,?¿!+]/)
    .reduce(
      (longestString, currString) =>
        currString.length > longestString.length ? currString : longestString,
      ''
    )
}
