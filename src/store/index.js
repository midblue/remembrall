import Vuex from 'vuex'
import Vue from 'vue';
const { get, set } = require('../assets/storage')

Vue.use(Vuex)

export default () => {
  return new Vuex.Store({
    state: {
      currentSet: loadFirstSet(),
      appState: 'study',
      editingCard: null,
    },
    mutations: {
      setAppState (state, newState) {
        state.appState = newState || 'deckList'
      },

      loadSet (state, id) {
        state.currentSet = loadSetById(id)
      },

      addCard (state, card) {
        state.currentSet.cards.push({
          ...card,
          id: Date.now()
        })
        saveSet(state.currentSet)
      },
      cardToEditId (state, id) {
        state.editingCard = state.currentSet.cards.find(c => c.id === id)
      },
      updateCard (state, card) {
        const foundCardIndex = state.currentSet.cards.findIndex(c => c.id === card.id)
        if (foundCardIndex !== undefined)
          for (let param in card)
            Vue.set(state.currentSet.cards[foundCardIndex], param, card[param])
        saveSet(state.currentSet)
      },
      deleteCard (state, id) {
        const newCards = state.currentSet.cards.filter(card => card.id !== id)
        Vue.set(state.currentSet, 'cards', newCards)
        saveSet(state.currentSet)
      }
    },
    actions: {
      nuxtServerInit({ commit }, context) {

      }
    }
  })
}

function loadSetById (id) {
  return loadSetsFromStorage()[id]
}

function loadFirstSet () {
  const allSets = loadSetsFromStorage()
  const firstKey = Object.keys( allSets )[0]
  return allSets[firstKey]
}

function loadSetsFromStorage () {
  const loadedSets = get('sets')
  if (loadedSets && loadedSets !== '') {
    let loadedSetsAsObject = JSON.parse(loadedSets)
    if (loadedSetsAsObject)
      return loadedSetsAsObject
  }
  return newSetList()
}

function saveSet (newSet) {
  let loadedSets = get('sets')
  if (loadedSets !== '')
    loadedSets = JSON.parse(loadedSets)
  if (loadedSets === null || loadedSets === '' || Array.isArray(loadedSets))
    loadedSets = {}
  loadedSets[newSet.id] = newSet
  set('sets', JSON.stringify(loadedSets))
}

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
    cards: [],
  }
}