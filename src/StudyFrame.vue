<template>
  <div
    class="studyframe"
    :class="{ focus: appState === 'study' || appState === 'editCard' || appState === 'addCard' }"
  >
    <input type="checkbox" v-model="reverse" />Study Back/Front
    <div class="floatnumber" v-if="displayTimeMod">
      {{ displayTimeMod }}
    </div>
    <template v-if="!done">
      <div class="sub centertext">
        <b>{{ currentlyReviewing.length }}</b> cards left to review
      </div>
      <div class="progressbar">
        <div 
          :style="{ width: (100 - ((currentlyReviewing.length / startedWith) * 100)) + '%' }"
        ></div>
      </div>
      <SingleCardStudy
        v-bind="currentlyReviewing[0]"
        :reverse="reverse"
        @done="nextCard"
      />
    </template>
    <template v-else-if="cards.length === 0">
      <h3>No cards yet!</h3>
      <div>Add some below.</div>
    </template>
    <template v-else>
      <h3>Done for now!</h3>
      <div v-if="nextReview">Next review in {{ nextReview }}</div>
    </template>
  </div>
</template>

<script>
const debug = false
import SingleCardStudy from './SingleCardStudy'
import { msToString } from './assets/commonFunctions'

export default {
  props: {
    cards: {},
  },
  components: {
    SingleCardStudy,
  },
  data () {
    return {
      checkForReviewsTimer: null,
      toReview: [],
      currentlyReviewing: [],
      startedWith: this.cards.length,
      displayTimeMod: null,
      reverse: false,
    }
  },
  computed: {
    appState () { return this.$store.state.appState },
    currentSetId () { return this.$store.state.currentSetId },
    sortedCards () {
      return this.cards.sort((a, b) => a.nextReview > b.nextReview ? 1 : -1)
    },
    done () {
      return this.currentlyReviewing.length === 0
    },
    nextReview () {
      if (!this.done) return '0m'
      const nextReview = this.sortedCards.reduce((selected, card) => {
        const cardNext = new Date(card.nextReview).getTime() 
        return cardNext < selected ? cardNext : selected
      }, 9999999999999999999)
      return Math.ceil((new Date(nextReview).getTime() - Date.now()) / 1000 / 60) + 'm'
    }
  },
  watch: {
    currentSetId () {
      this.currentlyReviewing = []
      this.startedWith = this.cards.length
      this.reverse = false
      this.toReview = []
      this.checkForReviews()
    },
    sortedCards () {
      this.checkForReviews()
    },
    toReview (newToReview) {
      const notInCurrentStack = newToReview.filter(newCard => 
        !this.currentlyReviewing.find(currCard =>
          currCard.id === newCard.id
        )
      )
      this.currentlyReviewing.push(...notInCurrentStack)
    },
    done (isDone) {
      if (isDone) this.checkForReviews()
    }
  },
  mounted () {
    this.checkForReviewsTimer = setInterval(this.checkForReviews, 10000)
    this.checkForReviews()
  },
  beforeDestroy () {
    clearInterval(this.checkForReviewsTimer)
  },
  methods: {
    nextCard (timeMod) {
      if (timeMod) {
        this.displayTimeMod = null
        this.$nextTick(() => this.displayTimeMod = '+' + msToString(timeMod))
      }
      this.currentlyReviewing.shift()
      this.$nextTick(this.checkForReviews)
    },
    checkForReviews () {
      const now = new Date()
      this.toReview = this.sortedCards.filter(card => {
        return debug || !card.nextReview || new Date(card.nextReview) <= now
      })
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

.progressbar {
  position: relative;
  width: 100%;
  height: 0px;

  div {
    background: #ccc;
    transition: .2s;
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

