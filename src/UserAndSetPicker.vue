<template>
  <div 
		class="userandsetpicker"
		:class="{
			fullscreen: !currentUser || isLoading,
			vertical: !currentUser,
		}"
	>
		<template v-if="!currentUser && !isLoading">
			<div>
				<b>Enter your username.</b>
			</div>
			<div>
				<input
					v-model="inputUsername"
					placeholder="username"
					ref="usernameInput"
				/>
			</div>
			<div>
				<button
					@click="logInAs"
				>Go</button>
			</div>
		</template>
		<template v-else-if="isLoading">
			<div class="sub">Loading...</div>
		</template>
		<template v-else>
			<div class="buttonlist inlineblock">
				<button
					v-for="set in setList"
					:key="set.id"
					:class="{
						active: parseInt(currentSetId) === set.id,
						duecards: dueReviews[set.id] > 0,
					}"
					@click="$store.commit('setCurrentSetId', set.id)"
				>
					{{ set.name }}
					<span
						v-if="!isMobile && dueReviews[set.id] > 0 && parseInt(currentSetId) !== set.id"
						class="sub"
					>
						({{ dueReviews[set.id] }})
					</span>
				</button><button
					@click="$store.commit('addSet')"
				>
					+<span v-if="!isMobile"> New Set</span>
				</button>
			</div>
			<div>
				<span><span v-if="!isMobile">Logged in as </span><b>{{ currentUser }}</b></span>
				<button @click="logOut">Log out</button>
			</div>
		</template>
  </div>
</template>

<script>
const { get } = require('./assets/storage')

export default {
  props: {
  },
  components: {
  },
  data () {
    return {
			isLoading: false,
			inputUsername: '',
			dueReviews: {},
    }
  },
  computed: {
    currentUser () { return this.$store.state.currentUser },
		setList () { return this.$store.state.setList },
		currentSetId () { return this.$store.state.currentSetId },
		isMobile () { return this.$store.state.isMobile },
  },
	watch: {
		currentUser (newUser) {
			this.isLoading = false
			const savedSetId = get('currentSetId')
			if (savedSetId && savedSetId !== '') {
				this.$store.commit('setCurrentSetId', savedSetId)
			}
			if (!newUser) this.$nextTick(this.focusInput)
		},
		setList () {
			this.isLoading = false
			this.updateDueReviews()
		},
		currentSetId () {
			this.isLoading = false
			this.updateDueReviews()
		},
	},
	mounted () {
		window.addEventListener('keydown', this.keyDown)
		this.updateDueReviews()
		window.setInterval(this.updateDueReviews, 2 * 60 * 1000)
		const savedUsername = get('currentUser')
		if (savedUsername && savedUsername !== '') {
			this.$store.dispatch('logInAs', savedUsername)
			this.isLoading = true
		}
		else {
			this.$nextTick(this.focusInput)
		}
	},
	beforeDestroy () {
		window.removeEventListener('keydown', this.keyDown)
  },
  methods: {
		logInAs () {
			if (this.inputUserName === '') return
			this.isLoading = true
			this.$store.dispatch('logInAs', this.inputUsername)
		},
		logOut () {
			this.$store.commit('logOut')
		},
		keyDown (event) {
			if (this.currentUser) return
			if (event.key === 'Enter')
				this.logInAs()
		},
		focusInput () {
			this.$refs.usernameInput.focus()
		},
		updateDueReviews () {
			const now = new Date()
			this.dueReviews = {}
			for (let set in this.setList) {
				if (parseDate(this.setList[set].lastStudied).getDate() !== now.getDate()) {
					this.$store.commit('resetSetDay', set)
				}
				const maxNewAndReviews = this.setList[set].maxReviewsPerDay + this.setList[set].maxNewPerDay
				const dueInDeck = this.setList[set].cards.reduce((dueCount, card) => 
					(parseDate(card.nextReview) < now)
						? dueCount + 1
						: dueCount
				, 0)
				this.dueReviews[set] = dueInDeck > maxNewAndReviews
					? maxNewAndReviews
					: dueInDeck

			}
		},
  }
}

function parseDate (nextReview) {
  return new Date(nextReview.seconds ? nextReview.seconds : nextReview)
}
</script>

<style lang="scss" scoped>

.userandsetpicker {
	padding: 0 50px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	background: #eee;
	margin-bottom: 30px;
	height: 70px;
	transition: .5s;
	position: relative;
	z-index: 10;

	@media (max-width: 768px) {
    padding: 0 20px;
	}

	&.fullscreen {
		height: 100vh;
		justify-content: center;
	}

	&.vertical {
		flex-direction: column;
		
		& > * {
			margin-bottom: 20px;
		}
	}
}

button:not(.active).duecards {
	background: #fd8;
}

.inlineblock {
	display: inline-block;
}

</style>

