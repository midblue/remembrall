<template>
  <div
    class="studyframe"
    :class="{ focus: appState === 'study' || appState === 'editCard' }"
  >
    <div class="sub" v-if="settings.studyReverse">
      Studying cards back-to-front.
      <u
        style="cursor: pointer;"
        @click="$store.commit('updateSetSettings', { studyReverse: false })"
      >
        Back to normal
      </u>
    </div>

    <FloatingText 
      :text="displayTimeMod"
      offset="-100"
    />

    <template v-if="!doneForDay">
      <div class="sub centertext padtb-small">
        <span v-if="newCards.length > 0">
          <b>{{ newCards.length }}</b> new cards and 
        </span>
        <b>{{ dueCards.length }}</b> review{{ dueCards.length === 1 ? '' : 's' }} left.
      </div>
      <div class="progressbar">
        <div 
          :style="{ width: (100 - (((newCards.length + dueCards.length) / startedWith) * 100)) + '%' }"
        ></div>
      </div>
      <SingleCardStudy
        v-bind="cardToStudy"
        :reverse="settings.studyReverse"
        @done="finishedCurrentCard"
      />
    </template>

    <template v-else-if="doneForDay && newCardsAreLeftOver">
      <div class="padtb centertext">
        <h3>Done for now!</h3>
        <div>There {{ newCardsLeftOver.length === 1 ? 'is' : 'are' }} <b>{{ newCardsLeftOver.length }}</b> new card{{ newCardsLeftOver.length === 1 ? '' : 's' }} remaining to be learned. If you want to study more new cards, change the setting below.
        </div>
        <p class="singlesetting">
          <EditableTextField
            class="visibletextfield"
            :text="`${ settings.maxNewPerDay || 10 }`"
            :lineBreaksAllowed="false"
            @endEdit="updateMaxNewPerDay"
          />&nbsp;&nbsp;
          <b>New cards per day</b>
        </p>
        <br />
        <br />
        <p v-if="nextReviewIn">Otherwise, your next review is in {{ nextReviewIn }}.</p>
      </div>
      <ReviewGraph
        :cards="sortedCards"
        :slots="10"
      />
    </template>

    <template v-else-if="cards.length === 0">
      <div class="padtb centertext">
        <h3>No cards yet!</h3>
        <button 
          @click="$store.commit('setAppState', 'addCard')"
        >+ Add Cards</button>
      </div>
    </template>

    <template v-else>
      <div class="padtb centertext">
        <h3>Done for now!</h3>
        <div v-if="nextReviewIn">Your next review is in {{ nextReviewIn }}.</div>
      </div>
      <ReviewGraph
        :cards="sortedCards"
        :slots="10"
      />
    </template>
  </div>
</template>

<script>
const debug = false
import SingleCardStudy from './SingleCardStudy'
import EditableTextField from './EditableTextField'
import ReviewGraph from './ReviewGraph'
import FloatingText from './FloatingText'
import { msToString } from './assets/commonFunctions'

export default {
  props: {
    cards: {},
  },
  components: {
    SingleCardStudy, ReviewGraph, FloatingText, EditableTextField, 
  },
  data () {
    return {
      refreshCardsTimer: null,
      startedWith: 0,
      displayTimeMod: null,
      updatableCards: []
    }
  },
  computed: {
    appState () { return this.$store.state.appState },
    currentSetId () { return this.$store.state.currentSetId },
    settings () { return this.$store.state.setList[this.$store.state.currentSetId].settings || {} },
    newToday () { return this.$store.state.setList[this.$store.state.currentSetId].newToday },
    sortedCards () {
      return this.updatableCards.sort((a, b) =>  
        a.nextReview > b.nextReview ? 1 : -1
      )
    },
    doneForDay () {
      return this.doneReviewing && this.doneWithNewCards
    },
    newCards () {
      return this.sortedCards
        .filter(card => card.totalReviews === 0 || !card.totalReviews)
        .slice(0, this.settings.maxNewPerDay - this.newToday)
    },
    doneWithNewCards () {
      return (this.newToday >= this.settings.maxNewPerDay || this.newCards.length === 0)
    },
    newCardsAreLeftOver () {
      return this.sortedCards
        .filter(card => card.totalReviews === 0 || !card.totalReviews)
        .length 
        + this.newToday
        > this.settings.maxNewPerDay
    },
    newCardsLeftOver () {
      if (!this.newCardsAreLeftOver) return 0
      return this.sortedCards
        .filter(card => card.totalReviews === 0 || !card.totalReviews)
    },
    dueCards () {
      const now = Date.now()
      return this.sortedCards
        .filter(card => 
          card.totalReviews
          && card.totalReviews > 0 
          && card.nextReview < now
        )
    },
    doneReviewing () {
      return (this.dueCards.length === 0)
    },
    allStudyableCards () {
      return [...this.newCards, ...this.dueCards]
    },
    cardToStudy () {
      return this.allStudyableCards[0]
    },
    nextReviewIn () {
      const reviewableCards = this.doneForDay
        ? this.sortedCards.filter(card => card.totalReviews && card.totalReviews > 0)
        : this.sortedCards
      const nextReview = reviewableCards.reduce((selected, card) => {
        const cardNext = card.nextReview 
        return cardNext < selected ? cardNext : selected
      }, 9999999999999999999)
      return msToString(nextReview - Date.now())
    },
  },
  watch: {
    currentSetId () {
      this.toReview = []
      this.refreshCards()
      this.startedWith = 0
    },
    cards () {
      this.refreshCards()
    },
    doneForDay (isDone) {
      if (isDone) {
        this.$nextTick(this.refreshCards)
        this.startedWith = 0
      }
    },
  },
  mounted () {
    if (this.settings.maxNewPerDay === undefined || this.settings.maxNewPerDay === null)
      this.$store.commit('updateSetSettings', { maxNewPerDay: 10 })
    if (this.settings.translationLink === undefined || this.settings.translationLink === null)
      this.$store.commit('updateSetSettings', { translationLink: true })
    if (this.settings.pronunciationLink === undefined || this.settings.pronunciationLink === null)
      this.$store.commit('updateSetSettings', { pronunciationLink: true })
    if (this.settings.studyReverse === undefined || this.settings.studyReverse === null)
      this.$store.commit('updateSetSettings', { studyReverse: false })
    
    this.refreshCardsTimer = setInterval(this.refreshCards, 10000)
    this.refreshCards()
    this.startedWith = this.dueCards.length + this.newCards.length
  },
  beforeDestroy () {
    clearInterval(this.refreshCardsTimer)
  },
  methods: {
    finishedCurrentCard (timeMod) {
      if (timeMod) {
        this.displayTimeMod = null
        this.$nextTick(() => this.displayTimeMod = '+' + msToString(timeMod))
      }
    },
    refreshCards () {
      this.updatableCards = [...this.cards]
      // this.$set(this, 'updatableCards', this.cards)
    },
    updateMaxNewPerDay (newValue) {
      const parsedValue = parseInt(newValue) || 10
      this.$store.commit('updateSetSettings', { maxNewPerDay: parsedValue })
    }
  }
}
</script>

<style lang="scss" scoped>

.studyframe {
  position: relative;
  opacity: .3;
  transition: all .5s;

  &.focus {
    opacity: 1;
  }
}

.padtb-small {
  padding-top: 15px;
  padding-bottom: 15px;
}
.padtb {
  padding: 100px 0;
}

.progressbar {
  position: relative;
  width: 100%;
  height: 0px;

  div {
    background: #ccc;
    transition: .5s;
    height: 5px;
  }
}

.singlesetting {
  display: inline-block;
  border-radius: 5px;
  padding: 15px 20px;
  background: #eee;

  & > * {
    min-width: 50px;
    display: inline-block;
  }
}

</style>

