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
    <div class="floatnumber" v-if="displayTimeMod">
      {{ displayTimeMod }}
    </div>

    <template v-if="!doneForDay">
      <div class="sub centertext padtb-small">
        <span v-if="newCards.length > 0">
          <b>{{ newCards.length }}</b> new cards and 
        </span>
        <b>{{ dueCards.length }}</b> reviews left today.
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
        <h3>Done for today!</h3>
        <div v-if="nextReviewIn">Your settings have a max of <b>{{ settings.maxNewPerDay }}</b> new cards per day. If you want to study more, change your max new cards per day in this set's settings.</div>
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
        <div v-if="nextReviewIn">Next review in {{ nextReviewIn }}.</div>
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
import ReviewGraph from './ReviewGraph'
import { msToString } from './assets/commonFunctions'

export default {
  props: {
    cards: {},
  },
  components: {
    SingleCardStudy, ReviewGraph
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
      if (!this.doneForDay) return '0s'
      const nextReview = this.sortedCards.reduce((selected, card) => {
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
      this.$set(this, 'updatableCards', this.cards)
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

  .floatnumber {
    // transform: translateX(25%);
    z-index: 100;
    width: 100%;
    position: absolute;
    text-align: center;
    user-select: none;
    pointer-events: none;
    animation: pointsscroll 1.5s normal forwards ease-out;
    color: green;
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

@keyframes pointsscroll {
  from {
    opacity: 0;
    bottom: 25%;
  }
  50% {
    opacity: 1;
  }
  to {
    opacity: 0;
    bottom: 40%;
  }
}


</style>

