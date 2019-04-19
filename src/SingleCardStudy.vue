<template>
  <div>
    <AutoSpeaker
      v-if="settings.languageTools"
      :text="textToSpeak"
      :language="settings.languageTools"
    />
    <Card
      class="card"
      ref="card"
      :id="id"
      :front="front"
      :back="back"
      :reverse="reverse"
      :timeMod="timeMod"
      :nextReview="nextReview"
      :totalReviews="totalReviews"
      :created="created"
      :ok="ok"
      :again="again"
      :forStudy="true"
      :showBack="showBack"
      :set="set"
      :imageURL="imageURL"
      @showBack="showBackAction"
    />

    <div class="buttonlist primary">
      <button class="showback" v-if="!showBack" @click="showBackAction" key="showback">
        Show Back
        <div>
          <kbd class="keyicon">Space</kbd>
        </div>
      </button>
      <template v-else>
        <button key="again" v-if="timeBonuses.again !== undefined" @click="answer('again')">
          Wrong
          <div>
            <kbd class="keyicon">1</kbd>
          </div>
        </button>
        <button key="ok" v-if="timeBonuses.ok" @click="answer('ok')">
          Right
          <div>
            <kbd class="keyicon">2</kbd>
            <span v-if="!isMobile">/</span>
            <kbd class="keyicon">Space</kbd>
          </div>
        </button>
      </template>
    </div>
    <br>
    <div class="centertext">
      <button @click="$emit('postpone')" style="padding-right: 15%; padding-left: 15%">
        Postpone
        <div>
          <span class="keyicon">P</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script>
import Card from './Card'
import AutoSpeaker from './AutoSpeaker'
import { msToString, getRandomImage } from './assets/commonFunctions'

const minimumTimeMod = 30 * 60 * 1000 // 30m
const difficultyModifiers = {
  ok: 2,
  again: 0.1,
}
const timeIgnoreCutoff = [300, 30 * 1000] // .3s / 30s

export default {
  props: {
    reverse: {},
    front: {},
    back: {},
    id: {},
    set: {},
    timeMod: {
      default: 0,
    },
    nextReview: {
      default: 0,
    },
    totalReviews: {
      default: 0,
    },
    imageURL: {},
    created: {
      default: () => new Date().getTime(),
    },
    ok: {
      default: 0,
    },
    again: {
      default: 0,
    },
  },
  components: {
    Card,
    AutoSpeaker,
  },
  data() {
    return {
      showBack: false,
      startedCardTime: new Date(),
      revealedBackTime: new Date(),
      averageTime: 7000,
      reviewsSoFar: 0,
      metaDown: false,
      textToSpeak: '',
      isFirefox: navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
    }
  },
  computed: {
    settings() {
      return this.$store.state.setList[this.$store.state.currentSetId].settings
    },
    isStudying() {
      return this.$store.state.appState === 'study'
    },
    isEditing() {
      return this.$store.state.appState === 'editCard'
    },
    isMobile() {
      return this.$store.state.isMobile
    },
    isEditingText() {
      return this.$store.state.isEditingText
    },
    isNewCard() {
      return !this.totalReviews || this.totalReviews === 0
    },
    timeBonuses() {
      let bonuses = {
        ok: this.getTimeBonus('ok'),
        again: this.getTimeBonus('again'),
      }
      return bonuses
    },
    formattedTimeBonuses() {
      const bonuses = { ...this.timeBonuses }
      for (let bonus in bonuses)
        bonuses[bonus] = Math.ceil(bonuses[bonus] / 1000 / 60) + 'm'
      return bonuses
    },
  },
  watch: {
    id(newId) {
      this.startedCardTime = new Date()
      this.showBack = false
      if (this.settings.autoSpeakFront) {
        this.textToSpeak = (this.reverse ? this.back : this.front).replace(
          /\n.*/g,
          ''
        )
      }
      const topOfCardVisible =
        this.$el.getBoundingClientRect().top + window.scrollY - 10
      if (topOfCardVisible > window.scrollY + 100) return
      window.scrollTo(0, topOfCardVisible)
    },
  },
  mounted() {
    window.addEventListener('keydown', this.keyDown)
    window.addEventListener('keyup', this.keyUp)
    if (this.settings.autoSpeakFront) {
      this.textToSpeak = (this.reverse ? this.back : this.front).replace(
        /\n.*/g,
        ''
      )
    }
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.keyDown)
    window.removeEventListener('keyup', this.keyUp)
  },
  methods: {
    showBackAction() {
      this.showBack = true
      this.revealedBackTime = new Date()
      const cardRect = this.$refs.card.$el.getBoundingClientRect()
      const bottomOfCardVisible =
        cardRect.top +
        window.scrollY +
        cardRect.height -
        window.innerHeight +
        (this.isMobile ? 70 : 120)
      if (bottomOfCardVisible <= 0 || bottomOfCardVisible < window.scrollY)
        return
      window.scrollTo(0, bottomOfCardVisible)
    },
    answer(difficulty) {
      this.showBack = false
      this.reviewsSoFar++

      const cardTime = this.revealedBackTime - this.startedCardTime

      // ignore too fast or too slow times
      const ignoreTime =
        cardTime < timeIgnoreCutoff[0] || cardTime > timeIgnoreCutoff[1]

      // update running average time
      if (!ignoreTime)
        this.averageTime =
          this.averageTime * ((this.reviewsSoFar - 1) / this.reviewsSoFar) +
          cardTime * (1 / this.reviewsSoFar)

      // calc time modifiers, all in 0-1 range
      // 0 being bad, 1 being good
      const bonuses = {}

      // depending on time taken, adds time
      bonuses.answerTime = ignoreTime
        ? 0
        : 1 - (cardTime - timeIgnoreCutoff[0]) / timeIgnoreCutoff[1]

      // if card is older, adds more time
      const maturityThreshold = 30
      bonuses.maturity =
        this.totalReviews > maturityThreshold
          ? 1
          : this.totalReviews / maturityThreshold

      // if card is usually succeeded on, adds more time
      const successRatio = ((this.ok || 0) * 0.2) / (this.again || 1)
      bonuses.successRatio = successRatio > 1 ? 1 : successRatio

      // depending on the length of the answer vs the length of the prompt, adds time
      let collectiveLength =
        this.front.length + //.replace(/\n.*/g, '')
        this.back.length -
        5
      if (collectiveLength < 0) collectiveLength = 0
      const lengthThreshold = 40
      bonuses.length =
        collectiveLength > lengthThreshold
          ? 1
          : collectiveLength / lengthThreshold

      const bonusMultipliers = {
        answerTime: 1,
        maturity: 0.8,
        successRatio: 0.8,
        length: 0.3,
      }

      let newTimeMod = this.timeBonuses[difficulty]
      for (let bonus in bonuses) {
        console.log(
          bonus + ' bonus:',
          (bonuses[bonus] * bonusMultipliers[bonus]).toFixed(2)
        )
        newTimeMod +=
          bonuses[bonus] *
          bonusMultipliers[bonus] *
          this.timeBonuses[difficulty]
      }
      newTimeMod = Math.floor(newTimeMod)

      // check for once-per-day setting
      let oncePerDayTimeMod = 10 * 60 * 60 * 1000 /* 10h */
      if (this.settings.oncePerDay && newTimeMod < oncePerDayTimeMod)
        newTimeMod = oncePerDayTimeMod

      console.log('old time mod:', msToString(this.timeMod))
      console.log('new time mod:', msToString(newTimeMod))
      console.log('')

      // calc interval until next review
      const newNextReview = new Date(Date.now() + newTimeMod).getTime()

      const newTotalReviews = this.totalReviews + 1
      const newAgain = this.again + (difficulty === 'again' ? 1 : 0)
      const newOk = newTotalReviews - newAgain

      // update card with new metadata
      this.$store.commit('studyCard', {
        id: this.id,
        lastStudied: Date.now(),
        timeMod: newTimeMod,
        nextReview: newNextReview,
        totalReviews: newTotalReviews,
        ok: newOk,
        again: newAgain,
      })

      // request new card from StudyFrame
      this.$emit('done', newTimeMod)
    },
    getTimeBonus(difficulty) {
      let newTimeMod =
        (!this.timeMod || isNaN(this.timeMod) ? 0 : this.timeMod) *
        difficultyModifiers[difficulty]
      if (newTimeMod < minimumTimeMod) newTimeMod = minimumTimeMod
      if (difficulty === 'again') newTimeMod = 0
      return newTimeMod
    },
    keyDown(event) {
      if (event.key === 'Control') this.metaDown = true
      if (event.key === 'Meta') this.metaDown = true
      else if (event.key === 'i' && this.metaDown) {
        this.$store.commit('updateCard', {
          id: this.id,
          imageURL: 'loading',
        })
        getRandomImage(this.front || this.back).then(image => {
          if (image)
            this.$store.commit('updateCard', {
              id: this.id,
              imageURL: image,
            })
        })
      }

      if (!this.isStudying || this.isEditingText) return
      if (event.key === '1' && this.showBack) this.answer('again')
      else if (event.key === ' ') {
        event.preventDefault()
        event.stopPropagation()
        !this.showBack ? this.showBackAction() : this.answer('ok')
      } else if (event.key === 'Enter') {
        event.preventDefault()
        event.stopPropagation()
        !this.showBack ? this.showBackAction() : this.answer('ok')
      } else if (event.key === '2' && this.showBack) this.answer('ok')
      else if (event.key === 'p') this.$emit('postpone')
    },
    keyUp(event) {
      if (event.key === 'Control') this.metaDown = false
      if (event.key === 'Meta') this.metaDown = false
    },
  },
}
</script>

<style lang="scss" scoped>
.card {
  margin-bottom: 20px;
}
.showback {
  width: 100%;
}
.buttonlist.primary {
  @media (max-width: 768px) {
    position: relative;
    z-index: 1000;
    width: 100%;
    border-radius: 0;
    position: fixed;
    bottom: 0;
    left: 0;
    border-bottom: none;

    button {
      background: #eee;
      border-radius: 0;

      &:hover {
        background: #ddd;
      }
    }
  }
}
</style>
