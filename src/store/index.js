import Vuex from 'vuex'
import Vue from 'vue';
const storage = require('../assets/storage')
const firestore = require('../assets/firestore')

Vue.use(Vuex)

export default () => {
  return new Vuex.Store({
    state: {
      currentUser: null,
      setList: [],
      currentSetId: null,
      appState: 'study',
      isMobile: false,
    },
    mutations: {
      // global vars
      setUsername (state, newUsername) {
        state.currentUser = newUsername
        storage.set('currentUser', newUsername)
      },
      setSetList (state, newSetList) {
        state.setList = newSetList
      },
      setCurrentSetId (state, newSetId) {
        state.currentSetId = newSetId
        storage.set('currentSetId', newSetId)
      },
      logOut (state) {
        state.currentUser = null
        state.setList = []
        state.currentSetId = null
      },
      setAppWidth (state, newWidth) {
        state.isMobile = parseInt(newWidth) <= 768
      },

      // app state
      setAppState (state, newState) {
        state.appState = newState || 'deckList'
      },

      // sets
      updateSetName (state, newName) {
        Vue.set(state.setList[state.currentSetId], 'name', newName)
        updateSetInDb(state.currentUser, state.setList[state.currentSetId])
      },
      updateSetSettings (state, newSettings) {
        for (let param in newSettings) {
          if (!state.setList[state.currentSetId].settings)
            state.setList[state.currentSetId].settings = {}
          Vue.set(state.setList[state.currentSetId].settings, param, newSettings[param])
        }
        updateSetInDb(state.currentUser, state.setList[state.currentSetId])
      },
      addSet (state) {
        const newSet = blankSet()
        state.setList[newSet.id] = newSet
        state.currentSetId = newSet.id
        storage.set('currentSetId', newSet.id)
        updateSetInDb(state.currentUser, state.setList[state.currentSetId])
      },
      deleteSet (state, setId) {
        Vue.delete(state.setList, setId)
        state.currentSetId = Object.keys(state.setList)[0]
        firestore.deleteSet(state.currentUser, setId)
      },

      // set-level daily review numbers
      addSetNewCardToday (state) {
        if (!state.setList[state.currentSetId].newToday) state.setList[state.currentSetId].newToday = 0
        Vue.set(state.setList[state.currentSetId], 'newToday', state.setList[state.currentSetId].newToday + 1)
        updateSetInDb(state.currentUser, state.setList[state.currentSetId])
      },
      addSetReviewCardToday (state) {
        if (!state.setList[state.currentSetId].reviewsToday) state.setList[state.currentSetId].reviewsToday = 0
        Vue.set(state.setList[state.currentSetId], 'reviewsToday', state.setList[state.currentSetId].reviewsToday + 1)
        updateSetInDb(state.currentUser, state.setList[state.currentSetId])
      },
      resetSetDay (state, setId) {
        Vue.set(state.setList[state.currentSetId], 'newToday', 0)
        Vue.set(state.setList[state.currentSetId], 'reviewsToday', 0)
        updateSetInDb(state.currentUser, state.setList[state.currentSetId])
      },

      // cards
      addCard (state, card) {
        state.setList[state.currentSetId].cards.push({
          ...card,
          id: Date.now()
        })
        updateSetInDb(state.currentUser, state.setList[state.currentSetId])
      },
      cardToEditId (state, id) {
        if (!id) state.editingCard = null
        state.editingCard = state.setList[state.currentSetId].cards.find(c => c.id === id)
      },
      updateCard (state, card) {
        const foundCardIndex = state.setList[state.currentSetId].cards.findIndex(c => c.id === card.id)
        if (foundCardIndex !== undefined)
          for (let param in card)
            Vue.set(state.setList[state.currentSetId].cards[foundCardIndex], param, card[param])
        updateSetInDb(state.currentUser, state.setList[state.currentSetId])
      },
      studyCard (state, card) {
        const foundCardIndex = state.setList[state.currentSetId].cards.findIndex(c => c.id === card.id)
        if (foundCardIndex !== undefined)
          for (let param in card)
            Vue.set(state.setList[state.currentSetId].cards[foundCardIndex], param, card[param])
        Vue.set(state.setList[state.currentSetId], 'lastStudied', Date.now())
        updateSetInDb(state.currentUser, state.setList[state.currentSetId])
      },
      deleteCard (state, id) {
        const newCards = state.setList[state.currentSetId].cards.filter(card => card.id !== id)
        Vue.set(state.setList[state.currentSetId], 'cards', newCards)
        updateSetInDb(state.currentUser, state.setList[state.currentSetId])
      },
    },
    actions: {
      logInAs ({ commit }, username) {
        firestore.getAllSets(username)
          .then(({docs, empty}) => {
            const setObject = {}
            docs.forEach(doc => {
              const set = doc.data()
              setObject[set.id] = set
            })
            commit('setCurrentSetId', Object.keys(setObject)[0])
            commit('setUsername', username)
            commit('setSetList', setObject)
          })
      },
    }
  })
}

let currentlyUpdating = false,
    updatedUserToSaveToDb,
    updatedSetToSaveToDb
setInterval(() => {
  if (!currentlyUpdating && updatedUserToSaveToDb && updatedSetToSaveToDb) {
    currentlyUpdating = true
    firestore.saveSet(updatedUserToSaveToDb, updatedSetToSaveToDb)
      .then(() => currentlyUpdating = false)
    updatedSetToSaveToDb = null
    updatedUserToSaveToDb = null
  }
}, 2000)
function updateSetInDb (user, set) {
  updatedUserToSaveToDb = user
  updatedSetToSaveToDb = set
}

// function loadSetById (id) {
//   return loadSetsFromLocalStorage()[id]
// }

// function loadFirstSet () {
//   const allSets = loadSetsFromLocalStorage()
//   const firstKey = Object.keys( allSets )[0]
//   return allSets[firstKey]
// }

// function loadSetsFromLocalStorage () {
//   const loadedSets = storage.get('sets')
//   if (loadedSets && loadedSets !== '') {
//     let loadedSetsAsObject = JSON.parse(loadedSets)
//     if (loadedSetsAsObject)
//       return loadedSetsAsObject
//   }
//   return newSetList()
// }

// function saveSetToLocalStorage (newSet) {
//   let loadedSets = storage.get('sets')
//   if (loadedSets !== '')
//     loadedSets = JSON.parse(loadedSets)
//   if (loadedSets === null || loadedSets === '' || Array.isArray(loadedSets))
//     loadedSets = {}
//   loadedSets[newSet.id] = newSet
//   starage.set('sets', JSON.stringify(loadedSets))
// }

function newSetList () {
  const newSet = blankSet()
  return {
    [blankSet.id] : newSet
  }
}

function blankSet() {
  const id = Date.now()
  return {
    id,
    name: 'New set',
    settings: {
      maxNewPerDay: 10,
      maxReviewsPerDay: 50,
      translationLink: false,
      pronunciationLink: false,
      studyReverse: false,
    },
    lastStudied: new Date(),
    newToday: 0,
    reviewsToday: 0,
    cards: [],
  }
}