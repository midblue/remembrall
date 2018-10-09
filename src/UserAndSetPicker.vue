<template>
  <div class="userandsetpicker">
		<template v-if="!currentUser && !isLoading">
			<b>Enter your username.</b>
			<input v-model="inputUsername" placeholder="username" />
			<button
				@click="logInAs"
			>Go</button>
		</template>
		<template v-else-if="isLoading">
			<div class="sub">Loading...</div>
		</template>
		<template v-else>
			<span>Logged in as <b>{{ currentUser }}</b></span>
			<button @click="logOut">Log out</button>
			<span>
				Sets:
				<button
					v-for="set in setList"
					:key="set.id"
					:class="{active: parseInt(currentSetId) === set.id}"
					@click="$store.commit('setCurrentSetId', set.id)"
				>
					{{ set.name }}
					<span class="sub">({{ set.cards.length }})</span>
				</button>
				<button
					@click="$store.commit('addSet')"
				>
					+ New Set
				</button>
			</span>
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
		currentUser () {
			this.isLoading = false
			const savedSetId = get('currentSetId')
			if (savedSetId && savedSetId !== '') {
				this.$store.commit('setCurrentSetId', savedSetId)
			}
		},
		setList () {
			this.isLoading = false
		},
		currentSetId () {
			this.isLoading = false
		},
		
	},
	mounted () {
		const savedUsername = get('currentUser')
		if (savedUsername && savedUsername !== '') {
			this.$store.dispatch('logInAs', savedUsername)
			this.isLoading = true
		}
	},
  methods: {
		logInAs () {
			if (this.inputUserName === '') return
			this.$store.dispatch('logInAs', this.inputUsername)
		},
		logOut () {
			this.$store.commit('logOut')
		}
  }
}
</script>

<style lang="scss" scoped>

.userandsetpicker {
	padding: 15px 50px;
	width: 100%;
	background: #eee;
	margin-bottom: 30px;
}

</style>

