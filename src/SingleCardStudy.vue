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
					<div class="sub">
						<a target="_blank" :href="pronunciationLink">Pronunciation</a> ・ 
						<a target="_blank" :href="translationLink">Translation</a>
					</div>
				</div>
			</div>
		</div>

		
		<div class="buttonlist">
			<button class="showback" v-if="!showBack" @click="showBack = true">
				Show Back
				<div>
					<span class="keyicon">Space</span>
				</div>
			</button>
			<template v-else>
				<button
					v-if="timeBonuses.again !== undefined"
					@click="answer('again')"
				>
					Wrong
					<div>
						<span class="keyicon">1</span>
					</div>
				</button><button
					v-if="timeBonuses.ok"
					@click="answer('ok')"
				>
					Right
					<div>
						<span class="keyicon">2</span>
						<span class="keyicon">Space</span>
					</div>
				</button>
			</template>
		</div>
		<div class="extraoptions">
			<button
				@click="deleteCard"
			>
				Delete Card
			</button>
		</div>
  </div>
</template>

<script>
import EditableTextField from './EditableTextField'

const minimumTimeMod = 10 * 60 * 1000 // 10m
const difficultyModifiers = {
	easy: 4,
	ok: 2,
	hard: 1,
	again: .1,
}
const timeIgnoreCutoff = [300, 30 * 1000] // .3s / 30s


export default {
  props: {
		reverse: {},
    front: {},
		back: {},
		id: {},
		timeMod: {
			default: minimumTimeMod,
		},
		nextReview: {
			default: 0,
		},
		totalReviews: {
			default: 0
		},
		created: {
			default: () => new Date(),
		},
		ok: {
			default: 0
		},
		again: {
			default: 0
		},
  },
  components: {
		EditableTextField,
  },
  data () {
    return {
      showBack: false,
			startedCardTime: new Date(),
			averageTime: 7000,
			reviewsSoFar: 0,
    }
  },
  computed: {
    isStudying () { return this.$store.state.appState === 'study' },
    isEditing () { return this.$store.state.appState === 'editCard' },
		pronunciationLink () {
			let linebreakPos = this.back.indexOf('\n')
			if (linebreakPos === -1)
				linebreakPos = this.back.length
			return `https://forvo.com/word/${ this.back.substring(0, linebreakPos) }/#es`
		},
		translationLink () {
			let linebreakPos = this.back.indexOf('\n')
			if (linebreakPos === -1)
				linebreakPos = this.back.length
			return `https://translate.google.com/#es/en/${ this.back.substring(0, linebreakPos) }`
		},
		timeBonuses () {
			let bonuses = {
				easy: this.getTimeBonus('easy'),
				ok: this.getTimeBonus('ok'),
				hard: this.getTimeBonus('hard'),
				again: this.getTimeBonus('again'),
			}
			if (bonuses.easy === bonuses.ok)
				delete bonuses.easy
			if (bonuses.hard === bonuses.ok)
				delete bonuses.hard
			return bonuses
		},
		formattedTimeBonuses () {
			const bonuses = { ...this.timeBonuses }
			for (let bonus in bonuses)
				bonuses[bonus] = Math.ceil(bonuses[bonus] / 1000 / 60) + 'm'
			return bonuses
		}
  },
	watch: {
		id () {
			this.startedCardTime = new Date()
		},
		isStudying (newFocus) {
			// if (newFocus) this.showBack = false
		}
	},
	mounted () {
		window.addEventListener('keydown', this.keyDown)
		window.addEventListener('keyup', this.keyUp)
	},
	beforeDestroy () {
		window.removeEventListener('keydown', this.keyDown)
		window.removeEventListener('keyup', this.keyUp)
	},
  methods: {
    answer (difficulty) {
			this.showBack = false
			this.reviewsSoFar ++
			const cardTime = new Date() - this.startedCardTime

			// ignore too fast or too slow times
			const ignoreTime = (cardTime < timeIgnoreCutoff[0] || cardTime > timeIgnoreCutoff[1])

			// update running average time
			if (!ignoreTime)
				this.averageTime = (this.averageTime * ((this.reviewsSoFar - 1) / this.reviewsSoFar)) + (cardTime * (1 / this.reviewsSoFar))
			
			// turn time into 0-1 range, 1 being fast
			const cardTimeNormalized = (1 - ((cardTime - timeIgnoreCutoff[0]) / timeIgnoreCutoff[1]))

			// calc time mod
			let newTimeMod = this.timeBonuses[difficulty]
			// depending on time taken, can up to double the push back
			if (!ignoreTime)
				newTimeMod += cardTimeNormalized * this.timeBonuses[difficulty]
			// depending on the length of the answer vs the length of the prompt, can affect timeMod

			// calc interval until next review
			const newNextReview = new Date(Date.now() + newTimeMod)

			console.log(cardTime, ignoreTime, cardTimeNormalized, this.timeMod, this.timeBonuses[difficulty], newTimeMod)

			// update card with new metadata
			this.$store.commit('updateCard', {
				id: this.id,
				timeMod: newTimeMod,
				nextReview: newNextReview,
				totalReviews: this.totalReviews + 1,
				created: this.created,
				ok: this.ok + (difficulty === 'ok' ? 1 : 0),
				again: this.again + (difficulty === 'again' ? 1 : 0),
			})

			// request new card from StudyFrame
			this.$emit('done', newTimeMod)
		},
		getTimeBonus ( difficulty ) {
			let newTimeMod = this.timeMod * difficultyModifiers[difficulty]
			if (newTimeMod < minimumTimeMod)
				newTimeMod = minimumTimeMod
			if (difficulty === 'again')
				newTimeMod = 0
			return newTimeMod
		},
		keyDown (event) {
			if (!this.isStudying) return
			if (event.key === '1') this.answer('again')
			// else if (event.key === '2') this.answer('hard')
			else if (event.key === ' ') {
				event.preventDefault()
				!this.showBack ? this.showBack = true : this.answer('ok')
			}
			else if (event.key === 'Enter') !this.showBack ? 
				this.showBack = true : this.answer('ok')
			else if (event.key === '2') this.answer('ok')
			// else if (event.key === '4') this.answer('easy')
		},
		keyUp (event) {
			if (!this.isStudying) return
			if (event.key === 'a' || event.key === 'Tab') this.addCard()
		},
		addCard () {
			this.$store.commit('setAppState', 'addCard')
		},
		deleteCard () {
			this.$store.commit('deleteCard', this.id)
		},
		startEdit () {
			this.$store.commit('setAppState', 'editCard')
		},
		saveEditedCard (side, newValue) {
			this.$store.commit('setAppState', 'study')
			if (this[side] === newValue) return
			this.$store.commit('updateCard', {
				id: this.id,
				[side]: newValue,
      })
		},
  }
}
</script>

<style lang="scss" scoped>

.card {
	background: #f8f8f8;
	margin-bottom: 20px;
	text-align: center;
}

.front, .back {
	transition: .2s;
}

.textfield {
	padding: 50px 20px;
	white-space: pre-wrap;

	&.editabletextediting {
		background: rgba(0, 0, 0, .05);
	}

	&:hover:not(.editabletextediting) {
		position: relative;
		background: rgba(0, 0, 0, .05);

		&:after {
			position: absolute;
			top: 10px;
			right: 10px;
			content: 'CLICK TO EDIT';
			font-weight: 600;
			font-size: .7em;
			opacity: .2;
		}
	}
}

.back {
	border-top: 1px solid #ddd;
	padding-bottom: 20px;
	transition: .2s;

	&.pointer {
		cursor: pointer;
	}

	.hideanswer {
		user-select: none;
		pointer-events: none;
		opacity: .2;
		filter: blur(5px);
	}
}

.showback {
	width: 100%;
}

.extraoptions {
	margin-top: 30px;
	width: 100%;

	button {
		display: block;
		margin: 0 auto;
	}
}

</style>

