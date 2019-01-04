const firestore = require('./firestore')
const localStorage = require('./localStorage')

const isOnline = true

if (isOnline) {
  // get all sets from firestore
  // compare updated date of local & firestore
  // reconcile localStorage changes with firestore
}

let currentlyUpdating = false,
  pendingUpdates = []

setInterval(() => {
  if (!currentlyUpdating && pendingUpdates.length) {
    currentlyUpdating = true
    const isOnline = true
    const newUpdate = pendingUpdates.shift()
    // console.log('attempting', newUpdate)

    if (newUpdate.type === 'newUser') {
      if (isOnline) {
        firestore.newUser(newUpdate.user).then(res => {
          // console.log(res)
          currentlyUpdating = false
          lastUpdated = Date.now()
        })
      } else {
        console.log('offline update', newUpdate)
        currentlyUpdating = false
        lastUpdated = Date.now()
      }
    } else if (newUpdate.type === 'updateSet') {
      localStorage.updateSet(newUpdate.user, newUpdate.set)
      if (isOnline) {
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
      } else {
        console.log('offline update', newUpdate)
        currentlyUpdating = false
        lastUpdated = Date.now()
      }
    } else if (newUpdate.type === 'setSet') {
      localStorage.setSet(newUpdate.user, newUpdate.set)
      if (isOnline) {
        firestore.setSet(newUpdate.user, newUpdate.set).then(res => {
          // console.log(res)
          currentlyUpdating = false
          lastUpdated = Date.now()
        })
      } else {
        console.log('offline update', newUpdate)
        currentlyUpdating = false
        lastUpdated = Date.now()
      }
    } else if (newUpdate.type === 'deleteSet') {
      localStorage.deleteSet(newUpdate.user, newUpdate.setId)
      if (isOnline) {
        firestore.deleteSet(newUpdate.user, newUpdate.setId).then(res => {
          // console.log(res)
          currentlyUpdating = false
          lastUpdated = Date.now()
        })
      } else {
        console.log('offline update', newUpdate)
        currentlyUpdating = false
        lastUpdated = Date.now()
      }
    } else {
      console.log('invalid db update, skipping...')
      currentlyUpdating = false
    }
  }
}, 100)

function getAllSets(user) {
  const isOnline = true
  if (isOnline) {
    return new Promise(resolve => {
      firestore.getAllSets(user).then(res => {
        resolve({
          isOnline,
          ...res,
        })
        currentlyUpdating = false
        lastUpdated = Date.now()
      })
    })
  } else {
    console.log('offline got all sets for', user)
    return new Promise(resolve => {
      const localSets = localStorage.getAllSets(user)
      resolve({
        sets: localSets,
        empty: Object.keys(localSets) === 0,
        isOnline,
      })
    })
  }
}

exports.newUser = function(user) {
  pendingUpdates.push({
    type: 'newUser',
    user,
  })
}

exports.updateSet = function(user, set) {
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

exports.getAllSets = getAllSets
