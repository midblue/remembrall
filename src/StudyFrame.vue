<template>
  <div
    class="studyframe"
    :class="{ focus: appState === 'study' }"
  >
    <template v-if="!done">
      <div class="sub centertext">
        <b>{{ currentlyReviewing.length }}</b> cards left to review
      </div>
      <div class="sub centertext">
        ({{ cards.length }} total in this set)
      </div>
      <div class="progressbar">
        <div 
          :style="{ width: (100 - ((currentlyReviewing.length / startedWith) * 100)) + '%' }"
        ></div>
      </div>
      <SingleCardStudy
        v-bind="currentlyReviewing[0]"
        @done="nextCard"
      />
    </template>
    <template v-else>
      <h3>Done for now!</h3>
      <div>Next review in {{ nextReview }}</div>
      <div class="sub">Cards in this set: {{ cards.length }}</div>
    </template>
  </div>
</template>

<script>
import SingleCardStudy from './SingleCardStudy'

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
    }
  },
  computed: {
    appState () { return this.$store.state.appState },
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
    nextCard () {
      this.currentlyReviewing.shift()
      this.$nextTick(this.checkForReviews)
    },
    checkForReviews () {
      const now = new Date()
      this.toReview = this.sortedCards.filter(card => {
        return !card.nextReview || new Date(card.nextReview) <= now
      })
    }
  }
}
</script>

<style lang="scss" scoped>

.studyframe {
  opacity: .3;
  transition: all .5s;

  &.focus {
    opacity: 1;
  }
}

.progressbar {
  position: relative;
  width: 100%;
  height: 5px;
  background: #eee;

  div {
    background: #ccc;
    transition: .2s;
    height: 100%;
  }
}

</style>

