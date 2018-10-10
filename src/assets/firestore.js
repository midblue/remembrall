const keys = require('../../keys')
const firebase = require("firebase/app")
require("firebase/firestore")

firebase.initializeApp({
	apiKey: keys.apiKey,
	authDomain: keys.authDomain,
	projectId: keys.projectId,
	storageBucket: keys.storageBucket,
})
const db = firebase.firestore()
db.settings({ timestampsInSnapshots: true })


exports.test = function () {
	console.log(db)
}

exports.saveSet = function (username, newSet) {
	console.log('SAVING')
	return new Promise(resolve =>
		db.collection('users')
			.doc(username)
			.collection('sets')
			.doc(`${ newSet.id }`)
			.set(newSet)
			.then(() => resolve('set success!'))
			.catch(e => resolve(e))
	)
}

exports.getSet = function (username, setId) {
	return new Promise(resolve =>
		db.collection('users')
			.doc(username)
			.collection('sets')
			.doc(`${ setId } `)
			.get()
			.then(set => resolve(set))
			.catch(e => resolve(e))
	)
}

exports.getAllSets = function (username) {
	return new Promise(resolve =>
		db.collection('users')
			.doc(username)
			.collection('sets')
			.get()
			.then(sets => resolve(sets))
			.catch(e => resolve(e))
	)
}

exports.deleteSet = function (username, setId) {
	return new Promise(resolve =>
		db.collection('users')
			.doc(username)
			.collection('sets')
			.doc(`${ setId }`)
			.delete()
			.then(set => resolve('delete successful'))
			.catch(e => resolve(e))
	)
}
