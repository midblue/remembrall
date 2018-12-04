import Vuex from 'vuex'
import Vue from 'vue'
const storage = require('../assets/storage')
const dbManager = require('../assets/dbManager')

Vue.use(Vuex)

export default () => {
  return new Vuex.Store({
    state: {
      currentUser: null,
      setList: {},
      currentSetId: null,
      appState: 'study',
      isMobile: false,
      pauseDbSets: false,
      isEditingText: false,
    },
    mutations: {
      // global vars
      setUsername(state, newUsername) {
        state.currentUser = newUsername
        storage.set('currentUser', newUsername)
      },
      setSetList(state, newSetList) {
        // for (let set in newSetList) { // clear out unnecessary props
        //   newSetList[set].cards = newSetList[set].cards.map(card => ({
        //     id: card.id,
        //     front: card.front,
        //     back: card.back,
        //     totalReviews: card.totalReviews,
        //     timeMod: card.timeMod,
        //     ok: card.ok,
        //     again: card.again,
        //     nextReview: new Date(card.nextReview).getTime(),
        //   }))
        // }
        state.setList = newSetList
      },
      setCurrentSetId(state, newSetId) {
        state.currentSetId = newSetId
        storage.set('currentSetId', newSetId)
      },
      logOut(state) {
        storage.remove('currentUser')
        storage.remove('currentSetId')
        state.currentUser = null
        state.setList = []
        state.currentSetId = null
      },
      setAppWidth(state, newWidth) {
        state.isMobile = parseInt(newWidth) <= 768
      },
      setPauseDbSets(state, shouldPause) {
        state.pauseDbSets = shouldPause
      },
      setIsEditingText(state, isEditing) {
        state.isEditingText = isEditing
      },

      // app state
      setAppState(state, newState) {
        state.appState = newState || 'study'
      },

      // sets
      updateSetName(state, newName) {
        Vue.set(state.setList[state.currentSetId], 'name', newName)
        // update set last updated
        Vue.set(state.setList[state.currentSetId], 'lastUpdated', Date.now())
        if (!state.pauseDbSets)
          dbManager.updateSet(state.currentUser, {
            id: state.currentSetId,
            name: state.setList[state.currentSetId].name,
            lastUpdated: state.setList[state.currentSetId].lastUpdated,
          })
      },
      updateSetSettings(state, newSettings) {
        for (let param in newSettings) {
          if (!state.setList[state.currentSetId].settings)
            state.setList[state.currentSetId].settings = {}
          Vue.set(
            state.setList[state.currentSetId].settings,
            param,
            newSettings[param]
          )
        }
        // update set last updated
        Vue.set(state.setList[state.currentSetId], 'lastUpdated', Date.now())
        if (!state.pauseDbSets)
          dbManager.updateSet(state.currentUser, {
            id: state.currentSetId,
            settings: state.setList[state.currentSetId].settings,
            lastUpdated: state.setList[state.currentSetId].lastUpdated,
          })
      },
      addSet(state) {
        const newSet = blankSet()
        state.setList[newSet.id] = newSet
        state.currentSetId = newSet.id
        storage.set('currentSetId', newSet.id)
        if (!state.pauseDbSets) dbManager.setSet(state.currentUser, newSet)
      },
      deleteSet(state, setId) {
        Vue.delete(state.setList, setId)
        state.currentSetId = Object.keys(state.setList)[0]
        if (!state.pauseDbSets) dbManager.deleteSet(state.currentUser, setId)
      },

      // set-level daily review numbers
      resetSetDay(state, setId) {
        Vue.set(state.setList[setId], 'newToday', 0)
        Vue.set(state.setList[setId], 'reviewsToday', 0)
        if (!state.pauseDbSets)
          dbManager.updateSet(state.currentUser, {
            id: setId,
            newToday: 0,
            reviewsToday: 0,
          })
      },

      // cards
      addCard(state, card) {
        const newCards = state.setList[state.currentSetId].cards || []
        newCards.push({
          ...card,
          id: Date.now(),
        })
        Vue.set(state.setList[state.currentSetId], 'cards', newCards)
        // update set last updated
        Vue.set(state.setList[state.currentSetId], 'lastUpdated', Date.now())
        if (!state.pauseDbSets)
          dbManager.updateSet(state.currentUser, {
            id: state.currentSetId,
            cards: state.setList[state.currentSetId].cards,
            lastUpdated: state.setList[state.currentSetId].lastUpdated,
          })
      },
      updateCard(state, card) {
        const foundCardIndex = state.setList[
          state.currentSetId
        ].cards.findIndex(c => c.id === card.id)
        if (foundCardIndex !== undefined)
          for (let param in card)
            Vue.set(
              state.setList[state.currentSetId].cards[foundCardIndex],
              param,
              card[param]
            )
        // update set last updated
        Vue.set(state.setList[state.currentSetId], 'lastUpdated', Date.now())
        // update db
        if (!state.pauseDbSets)
          dbManager.updateSet(state.currentUser, {
            id: state.currentSetId,
            cards: state.setList[state.currentSetId].cards,
            lastUpdated: state.setList[state.currentSetId].lastUpdated,
          })
      },
      studyCard(state, card) {
        const foundCardIndex = state.setList[
          state.currentSetId
        ].cards.findIndex(c => c.id === card.id)
        // update card data
        if (foundCardIndex !== undefined)
          for (let param in card)
            Vue.set(
              state.setList[state.currentSetId].cards[foundCardIndex],
              param,
              card[param]
            )
        // update newToday, reviewsToday
        if (
          new Date(state.setList[state.currentSetId].lastUpdated).getDate() !==
          new Date().getDate()
        ) {
          // new day
          Vue.set(state.setList[state.currentSetId], 'newToday', 0)
          Vue.set(state.setList[state.currentSetId], 'reviewsToday', 0)
        }
        if (card.totalReviews <= 1)
          Vue.set(
            state.setList[state.currentSetId],
            'newToday',
            state.setList[state.currentSetId].newToday
              ? state.setList[state.currentSetId].newToday + 1
              : 1
          )
        else
          Vue.set(
            state.setList[state.currentSetId],
            'reviewsToday',
            state.setList[state.currentSetId].reviewsToday
              ? state.setList[state.currentSetId].reviewsToday + 1
              : 1
          )
        // update set last updated
        Vue.set(state.setList[state.currentSetId], 'lastUpdated', Date.now())
        // update Db
        if (!state.pauseDbSets)
          dbManager.updateSet(state.currentUser, {
            id: state.currentSetId,
            lastUpdated: state.setList[state.currentSetId].lastUpdated,
            newToday: state.setList[state.currentSetId].newToday,
            reviewsToday: state.setList[state.currentSetId].reviewsToday,
            cards: state.setList[state.currentSetId].cards,
          })
      },
      deleteCard(state, id) {
        let setWithCard
        for (let set in state.setList)
          if (
            state.setList[set].cards &&
            state.setList[set].cards.find(card => card.id === id)
          ) {
            setWithCard = state.setList[set]
            break
          }
        if (!setWithCard)
          return console.log('No card found by that id in any deck.')
        const newCards = setWithCard.cards.filter(card => card.id !== id)
        Vue.set(setWithCard, 'cards', newCards)
        // update set last updated
        Vue.set(setWithCard, 'lastUpdated', Date.now())
        // update db
        if (!state.pauseDbSets)
          dbManager.updateSet(state.currentUser, {
            id: setWithCard.id,
            cards: setWithCard.cards,
            lastUpdated: setWithCard.lastUpdated,
          })
      },
      moveCard(state, { id, from, to }) {
        console.log(id, from, to)
        const cardToMove = state.setList[from].cards.find(
          card => card.id === id
        )
        if (!cardToMove) return
        // add to destination deck
        const newDestCards = state.setList[to].cards
        newDestCards.push(cardToMove)
        Vue.set(state.setList[to], 'cards', newDestCards)
        // update set last updated
        Vue.set(state.setList[to], 'lastUpdated', Date.now())
        if (!state.pauseDbSets)
          dbManager.updateSet(state.currentUser, {
            id: to,
            cards: state.setList[to].cards,
            lastUpdated: state.setList[to].lastUpdated,
          })
        // delete from source deck
        const newSourceCards = state.setList[from].cards.filter(
          card => card.id !== id
        )
        Vue.set(state.setList[from], 'cards', newSourceCards)
        // update set last updated
        Vue.set(state.setList[from], 'lastUpdated', Date.now())
        // update db
        if (!state.pauseDbSets)
          dbManager.updateSet(state.currentUser, {
            id: state.setList[from].id,
            cards: state.setList[from].cards,
            lastUpdated: state.setList[from].lastUpdated,
          })
      },
    },
    actions: {
      logInAs({ commit, state }, username) {
        dbManager.getAllSets(username).then(res => {
          const { docs, empty } = res

          // falsely empty state (disconnect)
          if (empty && username === state.currentUser) {
            console.log('dc')
            return commit('setPauseDbSets', false)
          }

          // get all sets from response
          let setObject = {}
          docs.forEach(doc => {
            const set = doc.data()
            setObject[set.id] = set
          })

          // just until everyone has all sets added
          for (let set in setObject) {
            setObject[set].cards = setObject[set].cards.map(card => ({
              ...card,
              set: parseInt(set),
            }))
          }

          // first ever load
          if (!state.currentUser && empty) {
            console.log('first')
            dbManager.newUser(username)
            if (Object.keys(setObject).length === 0) {
              setObject = newSetObject()
              dbManager.setSet(username, setObject[Object.keys(setObject)[0]])
            }
          }

          // refresh
          if (!empty && username === state.currentUser) {
            console.log('refresh')
            for (let id in setObject) {
              if (!state.setList[id]) {
                console.log(
                  'Deck ' +
                    id +
                    ' has been created elsewhere, and will now be loaded.'
                )
              }
              // if something in these sets has been updated elsewhere
              else if (
                setObject[id].lastUpdated < state.setList[id].lastUpdated
              ) {
                alert(`OLD SET IN DATABASE. Dumped set ${id} to localStorage.`)
                storage.set(`${id}`, state.setList[id].cards)
                console.log()
                console.log(setObject[id], state.setList[id])
              }
            }
          }

          // finish up
          commit('setUsername', username)
          commit('setSetList', setObject)
          commit(
            'setCurrentSetId',
            setObject[storage.get('currentSetId')]
              ? storage.get('currentSetId')
              : Object.keys(setObject)[0]
          )
          commit('setPauseDbSets', false)
        })
      },
    },
  })
}

function newSetObject() {
  const newSet = blankSet()
  return {
    [newSet.id]: newSet,
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
      languageTools: 'none',
      studyReverse: false,
    },
    lastUpdated: Date.now(),
    newToday: 0,
    reviewsToday: 0,
    cards: [],
  }
}

// function sanitizeCards(cards) {
//   return cards.map(card => ({
//     id: card.id,
//     again: card.again,
//     ok: card.ok,
//     totalReviews: card.totalReviews,
//     front: card.front,
//     back: card.back,
//     timeMod: card.timeMod,
//     nextReview: card.nextReview,
//   }))
// }
// const sanitizedCards = sanitizeCards(state.setList[state.currentSetId].cards)
// Vue.set(state.setList[state.currentSetId], 'cards', sanitizedCards)
