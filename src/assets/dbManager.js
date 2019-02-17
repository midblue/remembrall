const firestore = require('./firestore')

let currentlyUpdating = false,
  pendingUpdates = []

setInterval(() => {
  if (!currentlyUpdating && pendingUpdates.length) {
    currentlyUpdating = true
    const newUpdate = pendingUpdates.shift()
    // console.log('attempting', newUpdate)

    if (newUpdate.type === 'newUser') {
      firestore.newUser(newUpdate.user).then(res => {
        // console.log(res)
        currentlyUpdating = false
        lastUpdated = Date.now()
      })
    } else if (newUpdate.type === 'updateSet') {
      firestore.updateSet(newUpdate.user, newUpdate.set).then(res => {
        // console.log(res)
        if (res.code === 'not-found') {
          return firestore.setSet(newUpdate.user, newUpdate.set).then(res => {
            // console.log(res)
            currentlyUpdating = false
            lastUpdated = Date.now()
          })
        }
        currentlyUpdating = false
        lastUpdated = Date.now()
      })
    } else if (newUpdate.type === 'setSet') {
      firestore.setSet(newUpdate.user, newUpdate.set).then(res => {
        // console.log(res)
        currentlyUpdating = false
        lastUpdated = Date.now()
      })
    } else if (newUpdate.type === 'deleteSet') {
      firestore.deleteSet(newUpdate.user, newUpdate.setId).then(res => {
        // console.log(res)
        currentlyUpdating = false
        lastUpdated = Date.now()
      })
    }
    // else if (newUpdate.type === 'updateCard') {
    // 	firestore.updateCard(newUpdate.user, newUpdate.setId, newUpdate.card)
    // 		.then((res) => {
    // 			console.log(res)
    // 			currentlyUpdating = false
    // 			lastUpdated = Date.now()
    // 		})
    // }
    // else if (newUpdate.type === 'setCard') {
    // 	firestore.setCard(newUpdate.user, newUpdate.setId, newUpdate.card)
    // 		.then((res) => {
    // 			console.log(res)
    // 			currentlyUpdating = false
    // 			lastUpdated = Date.now()
    // 		})
    // }
    // else if (newUpdate.type === 'deleteCard') {
    // 	firestore.deleteCard(newUpdate.user, newUpdate.setId, newUpdate.cardId)
    // 		.then((res) => {
    // 			console.log(res)
    // 			currentlyUpdating = false
    // 			lastUpdated = Date.now()
    // 		})
    // }
    else {
      console.log('invalid db update, skipping...')
      currentlyUpdating = false
    }
  }
}, 100)

exports.newUser = function(user) {
  pendingUpdates.push({
    type: 'newUser',
    user,
  })
}

exports.updateSet = function(user, set, context) {
  pendingUpdates.push({
    type: 'updateSet',
    user,
    set,
  })
}

exports.setSet = function(user, set) {
  pendingUpdates.push({
    type: 'setSet',
    user,
    set,
  })
}

exports.deleteSet = function(user, setId) {
  pendingUpdates.push({
    type: 'deleteSet',
    user,
    setId,
  })
}

exports.getAllSets = firestore.getAllSets
exports.getCards = firestore.getCards

// exports.updateCard = function (user, setId, card) {
// 	pendingUpdates.push({
// 		type: 'updateCard',
// 		user,
// 		setId,
// 		card
// 	})
// }

// exports.setCard = function (user, setId, card) {
// 	pendingUpdates.push({
// 		type: 'setCard',
// 		user,
// 		setId,
// 		card
// 	})
// }

// exports.deleteCard = function (user, setId, cardId) {
// 	pendingUpdates.push({
// 		type: 'deleteCard',
// 		user,
// 		setId,
// 		cardId
// 	})
// }
