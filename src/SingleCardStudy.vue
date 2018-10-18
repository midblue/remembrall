<template>
  <div>
		<div class="card roundframe">
			<EditableTextField
				class="front textfield"
				:text="reverse ? back : front"
				@startEdit="startEdit"
				@endEdit="saveEditedCard(reverse ? 'back' : 'front', ...arguments)"
			/>
			<div 
				class="back"
				:class="{pointer: showBack === false}"
				@click="showBack = true"
			>
				<div
					:class="{hideanswer: !showBack}"
				>
					<EditableTextField
						class="textfield"
						:text="reverse ? front : back"
						@startEdit="startEdit"
						@endEdit="saveEditedCard(reverse ? 'front' : 'back', ...arguments)"
					/>
					<div class="sub" v-if="settings.languageTools">
						<a v-if="speaker" @click="speakWord" class="fakelink">Speak it</a>
						<span v-if="speaker"> ・ </span>
						<a target="_blank" :href="pronunciationLink">Native</a>
						<span> ・ </span>
						<a target="_blank" :href="translationLink">Translation</a>
					</div>
				</div>
			</div>
		</div>

		
		<div class="buttonlist primary">
			<button class="showback" v-if="!showBack" @click="showBack = true" key="showback">
				Show Back
				<div>
					<span class="keyicon">Space</span>
				</div>
			</button>
			<template v-else>
				<button
					key="again"
					v-if="timeBonuses.again !== undefined"
					@click="answer('again')"
				>
					Wrong
					<div>
						<span class="keyicon">1</span>
					</div>
				</button><button
					key="ok"
					v-if="timeBonuses.ok"
					@click="answer('ok')"
				>
					Right
					<div>
						<span class="keyicon">2</span>
						<span v-if="!isMobile"> / </span>
						<span class="keyicon">Space</span>
					</div>
				</button>
			</template>
		</div>
		<div class="extraoptions">
			<button
				key="delete"
				ref="deleteButton"
				@click="deleteCard"
			>
				Delete Card
			</button>
		</div>
  </div>
</template>

<script>
import EditableTextField from './EditableTextField'
import { msToString } from './assets/commonFunctions'

const minimumTimeMod = 10 * 60 * 1000 // 10m
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
    timeMod: {
      default: 0,
    },
    nextReview: {
      default: 0,
    },
    totalReviews: {
      default: 0,
    },
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
    EditableTextField,
  },
  data() {
    return {
      showBack: false,
      startedCardTime: new Date(),
      revealedBackTime: 0,
      averageTime: 7000,
      reviewsSoFar: 0,
      speaker: null,
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
    searchString() {
      let searchString = this.back
      let linebreakPos = this.back.indexOf('\n')
      if (linebreakPos !== -1)
        searchString = this.back.substring(0, linebreakPos)
      return searchString
    },
    searchWord() {
      return this.searchString
        .toLowerCase()
        .split(/[ /;.,?¿!+]/)
        .reduce(
          (longestString, currString) =>
            currString.length > longestString.length
              ? currString
              : longestString,
          ''
        )
    },
    pronunciationLink() {
      return `https://forvo.com/word/${this.searchWord}/#${
        this.settings.languageTools
      }`
    },
    translationLink() {
      return `https://translate.google.com/#${this.settings.languageTools}/en/${
        this.searchString
      }`
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
      // console.log('started studying', newId)
    },
    settings(newSettings) {
      this.speaker.lang = newSettings.languageTools
    },
    isStudying(newFocus) {
      // if (newFocus) this.showBack = false
    },
    showBack(willShow) {
      this.revealedBackTime = new Date()
    },
  },
  mounted() {
    window.addEventListener('keydown', this.keyDown)
    window.addEventListener('keyup', this.keyUp)
    if (window.speechSynthesis) {
      this.speaker = new SpeechSynthesisUtterance()
      this.speaker.lang = this.settings.languageTools
      this.speaker.volume = 0.4
    }
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.keyDown)
    window.removeEventListener('keyup', this.keyUp)
  },
  methods: {
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
        this.front.replace(/\n.*/g, '').length +
        this.back.replace(/\n.*/g, '').length -
        10
      if (collectiveLength < 0) collectiveLength = 0
      const lengthThreshold = 40
      bonuses.length =
        collectiveLength > lengthThreshold
          ? 1
          : collectiveLength / lengthThreshold

      const bonusMultipliers = {
        answerTime: 0.8,
        maturity: 1,
        successRatio: 0.5,
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

      console.log('new time mod:', msToString(newTimeMod), '\n')

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
      if (!this.isStudying || this.isEditingText) return
      if (event.key === '1') this.answer('again')
      else if (event.key === ' ') {
        event.preventDefault()
        !this.showBack ? (this.showBack = true) : this.answer('ok')
      } else if (event.key === 'Enter')
        !this.showBack ? (this.showBack = true) : this.answer('ok')
      else if (event.key === '2') this.answer('ok')
    },
    addCard() {
      this.$store.commit('setAppState', 'addCard')
    },
    deleteCard() {
      this.$store.commit('deleteCard', this.id)
      this.$emit('done')
      this.showBack = false
      this.$nextTick(() => {
        try {
          this.$refs.deleteButton.blur()
        } catch (e) {}
      })
    },
    startEdit() {
      this.$store.commit('setAppState', 'editCard')
      this.$store.commit('setIsEditingText', true)
    },
    saveEditedCard(side, newValue) {
      this.$store.commit('setAppState', 'study')
      this.$store.commit('setIsEditingText', false)
      if (this[side] === newValue) return
      this.$store.commit('updateCard', {
        id: this.id,
        [side]: newValue,
      })
    },
    speakWord() {
      this.speaker.text = this.searchString
      window.speechSynthesis.speak(this.speaker)
    },
  },
}
</script>

<style lang="scss" scoped>
.card {
  background: #f8f8f8;
  margin-bottom: 20px;
  text-align: center;
}

.front,
.back {
  transition: 0.2s;
}

.textfield {
  padding: 50px 20px;
  white-space: pre-wrap;
  font-size: 1.5rem;

  &.editabletextediting {
    background: rgba(0, 0, 0, 0.05);
  }

  &:hover:not(.editabletextediting) {
    position: relative;
    background: rgba(0, 0, 0, 0.05);

    &:after {
      position: absolute;
      top: 10px;
      right: 10px;
      content: 'CLICK TO EDIT';
      font-weight: 600;
      font-size: 0.5em;
      opacity: 0.2;
    }
  }
}

.back {
  border-top: 1px solid #ddd;
  padding-bottom: 20px;
  transition: 0.2s;

  &.pointer {
    cursor: pointer;
  }

  .hideanswer {
    user-select: none;
    pointer-events: none;
    opacity: 0.15;
    filter: blur(7px);
  }
}

.fakelink {
  text-decoration: underline;
  cursor: pointer;
}

.showback {
  width: 100%;
}

.extraoptions {
  margin: 40px 0;
  width: 100%;

  button {
    display: block;
    margin: 0 auto;
  }
}
</style>
