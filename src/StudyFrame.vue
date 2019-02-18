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
      :color="
        displayTimeMod
          ? displayTimeMod === 'Again!'
            ? '#fa4'
            : '#0c6'
          : 'green'
      "
      offset="-120"
    />

    <template v-if="!doneForDay">
      <div class="sub centertext padt-small">
        <span v-if="newCards.length > 0">
          <b>{{ newCards.length }}</b> new card{{
            newCards.length === 1 ? '' : 's'
          }}
          <span v-if="dueCards.length > 0">and</span>
        </span>
        <span v-if="dueCards.length > 0">
          <b>{{ dueCards.length }}</b> review{{
            dueCards.length === 1 ? '' : 's'
          }}
        </span>
        left.
      </div>
      <RemainingCardIndicator
        :toStudy="allStudyableCards"
        :startedWith="startedWith"
      />
      <SingleCardStudy
        v-bind="cardToStudy"
        :reverse="settings.studyReverse"
        @done="finishedCurrentCard"
        @postpone="postponeCurrentCard"
      />
    </template>

    <template v-else-if="doneForDay && reviewsAreLeftOver">
      <div class="padtb centertext">
        <h3>Done for now!</h3>
        <div>
          There {{ reviewsLeftOver === 1 ? 'is' : 'are' }}
          <b>{{ reviewsLeftOver }}</b> more card{{
            reviewsLeftOver === 1 ? '' : 's'
          }}
          due to be reviewed. If you want to study more cards today, change the
          setting below.
        </div>
        <p class="singlesetting">
          <EditableTextField
            class="visibletextfield"
            :text="`${settings.maxReviewsPerDay}`"
            :lineBreaksAllowed="false"
            @endEdit="updateMaxReviewsPerDay"
          />&nbsp;&nbsp; <b>Max reviews per day (0 for no limit)</b>
        </p>
        <br />
        <br />
        <p v-if="nextReviewIn">Otherwise, come back tomorrow to study more.</p>
      </div>
    </template>

    <template v-else-if="doneForDay && newCardsAreLeftOver">
      <div class="padtb centertext">
        <h3>Done for now!</h3>
        <div>
          There {{ newCardsLeftOver === 1 ? 'is' : 'are' }}
          <b>{{ newCardsLeftOver }}</b> new card{{
            newCardsLeftOver === 1 ? '' : 's'
          }}
          remaining to be learned. If you want to study more new cards, change
          the setting below.
        </div>
        <p class="singlesetting">
          <EditableTextField
            class="visibletextfield"
            :text="`${settings.maxNewPerDay}`"
            :lineBreaksAllowed="false"
            @endEdit="updateMaxNewPerDay"
          />&nbsp;&nbsp; <b>New cards per day</b>
        </p>
        <br />
        <br />
        <p v-if="nextReviewIn">
          Otherwise, your next review is in {{ nextReviewIn }}.
        </p>
      </div>
    </template>

    <template v-else-if="cards.length === 0">
      <div class="padtb centertext">
        <h3>No cards yet!</h3>
        <button @click="$store.commit('setAppState', 'addCard')">
          + Add Cards
        </button>
      </div>
    </template>

    <template v-else>
      <div class="padtb centertext">
        <h3>Done for now!</h3>
        <div v-if="nextReviewIn">
          Your next review is in {{ nextReviewIn }}.
        </div>
      </div>
    </template>

    <template v-if="doneForDay && cards.length > 0">
      <ReviewGraph
        :cards="updatedCards"
        :slots="7"
        :maxTime="7 * 24 * 60 * 60 * 1000"
        title="Upcoming reviews:"
      />
    </template>
  </div>
</template>

<script>
const debug = false
import SingleCardStudy from './SingleCardStudy'
import EditableTextField from './EditableTextField'
import RemainingCardIndicator from './RemainingCardIndicator'
import ReviewGraph from './ReviewGraph'
import FloatingText from './FloatingText'
import { msToString } from './assets/commonFunctions'

export default {
  props: {
    cards: {},
  },
  components: {
    SingleCardStudy,
    ReviewGraph,
    FloatingText,
    EditableTextField,
    RemainingCardIndicator,
  },
  data() {
    return {
      refreshCardsTimer: null,
      startedWith: 0,
      displayTimeMod: null,
      updatedCards: [],
      cardsToStudy: [],
    }
  },
  computed: {
    appState() {
      return this.$store.state.appState
    },
    currentSetId() {
      return this.$store.state.currentSetId
    },
    settings() {
      return (
        this.$store.state.setList[this.$store.state.currentSetId].settings || {}
      )
    },
    newToday() {
      return this.$store.state.setList[this.$store.state.currentSetId].newToday
    },
    reviewsToday() {
      return this.$store.state.setList[this.$store.state.currentSetId]
        .reviewsToday
    },
    doneForDay() {
      return this.doneReviewing && this.doneWithNewCards
    },
    newCards() {
      const possibleAdditionalNewCardsToday =
        (this.settings.maxNewPerDay || 0) - (this.newToday || 0)
      return this.updatedCards
        .filter(
          card =>
            !card.totalReviews &&
            (!card.nextReview || card.nextReview < Date.now())
        )
        .sort((a, b) =>
          // this.settings.shuffleCards
          // ? Math.random() - 0.5:
          a.id > b.id ? 1 : -1
        )
        .slice(
          0,
          possibleAdditionalNewCardsToday > 0
            ? possibleAdditionalNewCardsToday
            : 0
        )
    },
    doneWithNewCards() {
      return (
        this.newToday >= this.settings.maxNewPerDay ||
        this.newCards.length === 0
      )
    },
    newCardsAreLeftOver() {
      const newCardsCount = this.updatedCards.filter(
        card => card.totalReviews === 0 || !card.totalReviews
      ).length
      return (
        newCardsCount > 0 &&
        newCardsCount + this.newToday > this.settings.maxNewPerDay
      )
    },
    newCardsLeftOver() {
      if (!this.newCardsAreLeftOver) return 0
      return this.updatedCards.filter(
        card => card.totalReviews === 0 || !card.totalReviews
      ).length
    },
    dueCards() {
      const possibleAdditionalDueCardsToday = !this.settings.maxReviewsPerDay
        ? 99999
        : this.settings.maxReviewsPerDay - (this.reviewsToday || 0)
      const now = Date.now()
      return this.updatedCards
        .filter(
          card =>
            card.totalReviews && card.totalReviews > 0 && card.nextReview < now
        )
        .sort((a, b) => (a.nextReview > b.nextReview ? 1 : -1))
        .slice(
          0,
          possibleAdditionalDueCardsToday > 0
            ? possibleAdditionalDueCardsToday
            : 0
        )
    },
    doneReviewing() {
      return (
        this.dueCards.length === 0 ||
        (this.settings.maxReviewsPerDay &&
          this.reviewsToday >= this.settings.maxReviewsPerDay)
      )
    },
    reviewsAreLeftOver() {
      return this.doneReviewing && this.dueCards.length
    },
    reviewsLeftOver() {
      return this.dueCards.length
    },
    allStudyableCards() {
      let cards = this.doneWithNewCards
        ? [...this.dueCards]
        : [...this.newCards, ...this.dueCards]
      return cards
    },
    cardToStudy() {
      return this.cardsToStudy[0]
    },
    nextReviewIn() {
      if (
        this.settings.maxReviewsPerDay &&
        this.reviewsToday >= this.settings.maxReviewsPerDay
      )
        return 'a day'
      const reviewableCards = this.doneForDay
        ? this.updatedCards.filter(
            card => card.totalReviews && card.totalReviews > 0
          )
        : this.updatedCards
      const nextReview = reviewableCards.reduce((selected, card) => {
        const cardNext = card.nextReview
        return cardNext < selected ? cardNext : selected
      }, 9999999999999999999)
      return msToString(nextReview - Date.now())
    },
  },
  watch: {
    currentSetId() {
      this.toReview = []
      this.$nextTick(() => {
        this.refreshCards()
        this.startedWith = this.dueCards.length + this.newCards.length
      })
    },
    cards() {
      this.$nextTick(this.refreshCards)
    },
    doneForDay(isDone) {
      if (isDone) {
        window.scrollTo(0, 0)
        this.$nextTick(this.refreshCards)
        this.startedWith = 0
      }
    },
    allStudyableCards(newStudyable) {
      const shuffleArray = arr => arr.sort(() => Math.random() - 0.5)
      const shuffleArrayLeaveFirstAndLast = arr => [
        ...arr.slice(0, 1),
        ...shuffleArray(arr.slice(1, arr.length - 2)),
        ...arr.slice(arr.length - 2),
      ]

      const newCardsToAdd = newStudyable.filter(
        toStudy =>
          !this.cardsToStudy.find(
            existingCard => existingCard.id === toStudy.id
          )
      )

      const hasUpdatedElsewhere = !!this.cardsToStudy.find(
        existingCard =>
          !newStudyable.find(toStudy => existingCard.id === toStudy.id)
      )
      if (hasUpdatedElsewhere)
        return (this.cardsToStudy = this.settings.shuffleCards
          ? shuffleArray(newStudyable)
          : newStudyable)

      if (newCardsToAdd.length === 0) return
      const newCardsToStudy = [
        ...this.cardsToStudy,
        ...(this.settings.shuffleCards
          ? shuffleArray(newCardsToAdd)
          : newCardsToAdd),
      ]
      this.cardsToStudy = this.settings.shuffleCards
        ? shuffleArrayLeaveFirstAndLast(newCardsToStudy)
        : newCardsToStudy.sort((a, b) => a.nextReview - b.nextReview)
    },
  },
  mounted() {
    if (
      this.settings.maxNewPerDay === undefined ||
      this.settings.maxNewPerDay === null
    )
      this.$store.commit('updateSetSettings', { maxNewPerDay: 10 })
    if (
      this.settings.studyReverse === undefined ||
      this.settings.studyReverse === null
    )
      this.$store.commit('updateSetSettings', { studyReverse: false })

    this.refreshCardsTimer = setInterval(this.refreshCards, 10000)
    this.refreshCards()
    this.startedWith = this.dueCards.length + this.newCards.length
  },
  beforeDestroy() {
    clearInterval(this.refreshCardsTimer)
  },
  methods: {
    finishedCurrentCard(timeMod) {
      this.cardsToStudy.shift()
      if (timeMod === undefined) return
      const text = timeMod ? '+' + msToString(timeMod) : 'Again!'
      this.displayTimeMod = null
      this.$nextTick(() => (this.displayTimeMod = text))
      this.preloadNextImage()
    },
    postponeCurrentCard() {
      const card = this.cardsToStudy.shift()
      const timeToPostpone = 1 * 60 * 60 * 1000 // 1 hr
      this.$store.commit('updateCard', {
        id: card.id,
        nextReview: new Date(Date.now() + timeToPostpone).getTime(),
      })
      this.displayTimeMod = null
      this.$nextTick(
        () =>
          (this.displayTimeMod = 'Postponed for ' + msToString(timeToPostpone))
      )
      this.preloadNextImage()
    },
    preloadNextImage() {
      const nextCard = this.cardsToStudy[1]
      if (!nextCard || !nextCard.imageURL) return
      const preload = new Image()
      preload.src = nextCard.imageURL
      console.log('preloaded', nextCard.imageURL)
    },
    refreshCards() {
      this.updatedCards = [...this.cards.filter(card => !card.suspended)]
    },
    updateMaxNewPerDay(newValue) {
      const parsedValue = parseInt(newValue) || 10
      this.$store.commit('updateSetSettings', { maxNewPerDay: parsedValue })
    },
    updateMaxReviewsPerDay(newValue) {
      const parsedValue = parseInt(newValue) || 0
      this.$store.commit('updateSetSettings', { maxReviewsPerDay: parsedValue })
    },
  },
}
</script>

<style lang="scss" scoped>
.studyframe {
  position: relative;
  opacity: 0.3;
  transition: all 0.5s;

  &.focus {
    opacity: 1;
  }
}

.padt-small {
  padding-top: 15px;
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
    transition: 0.5s;
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
