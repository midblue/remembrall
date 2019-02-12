const keys = require('../../keys')
const firebase = require('firebase/app')
require('firebase/firestore')

firebase.initializeApp({
  apiKey: keys.apiKey,
  authDomain: keys.authDomain,
  projectId: keys.projectId,
  storageBucket: keys.storageBucket,
})
const db = firebase.firestore()

const userCollectionName = 'users'
const setCollectionName = 'sets'

exports.newUser = function(username) {
  return new Promise(resolve =>
    db
      .collection(userCollectionName)
      .doc(username)
      .set({})
      .then(() => resolve('create new user success!'))
      .catch(e => resolve(e))
  )
}

exports.setSet = function(username, newSet) {
  return new Promise(resolve =>
    db
      .collection(userCollectionName)
      .doc(username)
      .collection(setCollectionName)
      .doc(`${newSet.id}`)
      .set(newSet)
      .then(() => resolve('set set success!'))
      .catch(e => resolve(e))
  )
}

exports.updateSet = function(username, newSet) {
  return new Promise(resolve =>
    db
      .collection(userCollectionName)
      .doc(username)
      .collection(setCollectionName)
      .doc(`${newSet.id}`)
      .update(newSet)
      .then(() => resolve('update set success!'))
      .catch(e => resolve(e))
  )
}

exports.getSet = function(username, setId) {
  return new Promise(resolve =>
    db
      .collection(userCollectionName)
      .doc(username)
      .collection(setCollectionName)
      .doc(`${setId}`)
      .get()
      .then(set => resolve(set))
      .catch(e => resolve(e))
  )
}

exports.getAllSets = function(username) {
  return new Promise(resolve =>
    db
      .collection(userCollectionName)
      .doc(username)
      .collection(setCollectionName)
      .get()
      .then(sets => resolve(sets))
      .catch(e => resolve(e))
  )
}

exports.deleteSet = function(username, setId) {
  return new Promise(resolve =>
    db
      .collection(userCollectionName)
      .doc(username)
      .collection(setCollectionName)
      .doc(`${setId}`)
      .delete()
      .then(set => resolve('delete set successful'))
      .catch(e => resolve(e))
  )
}

// TODO migrate back lol
// function migrateCardsToDoc(username, setId) {
//   db.collection(userCollectionName)
//     .doc(username)
//     .collection(setCollectionName)
//     .doc(`${setId}`)
//     .collection('cards')
//     .get()
//     .then(cards => {
//       db.collection(userCollectionName)
//         .doc(username)
//         .collection(setCollectionName)
//         .doc(`${setId}`)
//         .update({
//           cards: cards.docs.map(card => card.data()),
//         })
//     })
// }

// migrateCardsToDoc('mariko', 1539060033892)

// function deleteCollection (username, setId, collectionName) {
// 	db.collection(userCollectionName)
// 		.doc(username)
// 		.collection(setCollectionName)
// 		.doc(`${setId}`)
// 		.collection('cards')
// 		.get()
// 		.then(cards => {
// 			cards.docs.forEach(card => card.delete())
// 		})
// }

// exports.setCard = function (username, setId, newCard) {
// 	return new Promise(resolve =>
// 		db.collection(userCollectionName)
// 			.doc(username)
// 			.collection(setCollectionName)
// 			.doc(`${setId}`)
// 			.collection(cardCollectionName)
// 			.doc(`${newCard.id}`)
// 			.set(newCard)
// 			.then(() => resolve('set card success!'))
// 			.catch(e => resolve(e))
// 	)
// }

// exports.updateCard = function (username, setId, newCard) {
// 	return new Promise(resolve =>
// 		db.collection(userCollectionName)
// 			.doc(username)
// 			.collection(setCollectionName)
// 			.doc(`${setId}`)
// 			.collection(cardCollectionName)
// 			.doc(`${newCard.id}`)
// 			.update(newCard)
// 			.then(() => resolve('update card success!'))
// 			.catch(e => resolve(e))
// 	)
// }

// exports.getCards = function (username, setId) {
// 	return new Promise(resolve =>
// 		db.collection(userCollectionName)
// 			.doc(username)
// 			.collection(setCollectionName)
// 			.doc(`${setId}`)
// 			.collection(cardCollectionName)
// 			.get()
// 			.then(cards => resolve(cards || []))
// 			.catch(e => resolve([]))
// 	)
// }

// exports.deleteCard = function (username, setId, cardId) {
// 	return new Promise(resolve =>
// 		db.collection(userCollectionName)
// 			.doc(username)
// 			.collection(setCollectionName)
// 			.doc(`${setId}`)
// 			.collection(cardCollectionName)
// 			.doc(`${cardId}`)
// 			.delete()
// 			.then(card => resolve('delete card successful'))
// 			.catch(e => resolve(e))
// 	)
// }
