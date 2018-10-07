<template>
  <div>
		<div class="card">
			<div class="front">{{
				 reverse ? back : front
			}}</div>
			<div 
				class="back"
			>
				<div
					:class="{hideanswer: !showBack}"
				>
					<div>{{
						reverse ? front : back
					}}</div>
					<div class="sub">
						<a target="_blank" :href="pronunciationLink">Pronunciation</a><br />
						<a target="_blank" :href="translationLink">Translation</a>

					</div>
				</div>
			</div>
		</div>

		<button class="showback" v-if="!showBack" @click="showBack = true">
			Show Back
			<div class="sub">(Space)</div>
		</button>
		<div v-if="showBack" class="buttonlist">
			<button
				v-if="timeBonuses.again !== undefined"
				@click="answer('again')"
			>
				Wrong
				<div class="sub">(1)</div>
			</button><button
				v-if="timeBonuses.ok"
				@click="answer('ok')"
			>
			  Right
				<div class="sub">(2/Space)</div>
			</button>
		</div>
		<template>
			<div class="extraoptions">
				<button
					@click="editCard"
				>
					Edit Card
				</button><button
					@click="deleteCard"
				>
					Delete Card
				</button>
			</div>
		</template>
  </div>
</template>

<script>
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
    isFocused () { return this.$store.state.appState === 'study' },
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
		isFocused (newFocus) {
			if (newFocus) this.showBack = false
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
			if (!this.isFocused) return
			if (event.key === '1') this.answer('again')
			// else if (event.key === '2') this.answer('hard')
			else if (event.key === ' ') !this.showBack ? 
				this.showBack = true : this.answer('ok')
			else if (event.key === 'Enter') !this.showBack ? 
				this.showBack = true : this.answer('ok')
			else if (event.key === '2') this.answer('ok')
			// else if (event.key === '4') this.answer('easy')
		},
		keyUp (event) {
			if (!this.isFocused) return
			if (event.key === 'e') this.editCard()
			if (event.key === 'a' || event.key === 'Tab') this.addCard()
		},
		addCard () {
			this.$store.commit('setAppState', 'addCard')
		},
		deleteCard () {
			this.$store.commit('deleteCard', this.id)
		},
		editCard () {
			this.$store.commit('setAppState', 'editCard')
			this.$store.commit('cardToEditId', this.id)
		},
  }
}
</script>

<style lang="scss" scoped>

.card {
	background: #f8f8f8;
	margin: 20px 0;
}

.front, .back {
	white-space: pre-wrap;
	padding: 50px 20px;
	text-align: center;
	transition: .2s;
}

.back {
	border-top: 1px solid #ddd;

	.hideanswer {
		user-select: none;
		opacity: .2;
		filter: blur(5px);
	}
}

.buttonlist {
	display: flex;
}

button {
	flex: 1;
	margin: 0;
	border: 1px solid #ddd;
	background: #eee;
	font-size: 0.9rem;
	padding: 10px;
  font-family: 'Avenir', sans-serif;
}

.showback {
	width: 100%;
}

.extraoptions {
	margin-top: 30px;
}

</style>

