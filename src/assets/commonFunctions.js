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

function findImagesForKeyword(keyword, count = 10, offset = 0) {
  const urlBase = `https://www.googleapis.com/customsearch/v1?imgSize=large&imgType=photo&searchType=image&key=${
    keys.GOOGLE
  }&cx=${keys.GSEARCH}`
  const query = encodeURI(keyword)
  return new Promise(resolve => {
    fetch(`${urlBase}&q=${query}&num=${count}&start=${offset}`)
      .then(res => res.json())
      .then(json => {
        if (!json.items) resolve([])
        else resolve(json.items.map(image => image.link))
      })
  })
}
exports.findImagesForKeyword = findImagesForKeyword

function getKeyWord(text, allowSpaces = false) {
  return text
    .replace(/\(.*\)/g, '')
    .replace(/[*_-]/g, '')
    .split('\n')[0]
    .toLowerCase()
    .split(allowSpaces ? /[/;.,?¿!+()\[\]{}<>]/ : /[  ・/;.,?¿!+()\[\]{}<>]/)
    .reduce(
      (longestString, currString) =>
        currString.length > longestString.length ? currString : longestString,
      ''
    )
}
exports.getKeyWord = getKeyWord

let currOffset = 1
exports.getRandomImage = function(text) {
  const keyword = getKeyWord(text, true)
  currOffset = (currOffset % 99) + 1
  return new Promise(resolve => {
    findImagesForKeyword(keyword, 1, currOffset).then(images => {
      if (images) resolve(images[Math.floor(Math.random() * images.length)])
      else resolve()
    })
  })
}

exports.getNumberDueInSet = function(set) {
  const now = Date.now()
  const maxNew = set.settings ? set.settings.maxNewPerDay : 999999
  const newToday = set.newToday
  if (!set.cards) return 0

  const dueInDeck = Math.min(
    set.cards.reduce(
      (dueCount, card) =>
        card.nextReview < now &&
        card.totalReviews &&
        card.totalReviews > 0 &&
        !card.suspended
          ? dueCount + 1
          : dueCount,
      0
    ),
    set.settings && set.settings.maxReviewsPerDay
      ? set.settings.maxReviewsPerDay - set.reviewsToday
      : 999999
  )
  const newInDeck = set.cards.reduce(
    (dueCount, card) =>
      (!card.totalReviews || card.totalReviews === 0) && !card.suspended
        ? dueCount + 1
        : dueCount,
    0
  )
  return dueInDeck + Math.min(maxNew - Math.min(newToday, maxNew), newInDeck)
}
