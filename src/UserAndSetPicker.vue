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
					:class="{active: parseInt(currentSetId) === set.id}"
					@click="$store.commit('setCurrentSetId', set.id)"
				>
					{{ set.name }}
					<span class="sub">({{ set.cards.length }})</span>
				</button><button
					@click="$store.commit('addSet')"
				>
					+ New Set
				</button>
			</div>
			<div>
				<span>Logged in as <b>{{ currentUser }}</b></span>
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
    }
  },
  computed: {
    currentUser () { return this.$store.state.currentUser },
		setList () { return this.$store.state.setList },
		currentSetId () { return this.$store.state.currentSetId },
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
		},
		currentSetId () {
			this.isLoading = false
		},
	},
	mounted () {
		window.addEventListener('keydown', this.keyDown)
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
		}
  }
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

.inlineblock {
	display: inline-block;
}

</style>

