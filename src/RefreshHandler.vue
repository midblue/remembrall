<template>
	<div
		class="refreshtakeover"
		:class="{on: refreshing}"
	>
		<span>Refreshing...</span>
	</div>
</template>

<script>
export default {
  data() {
    return {
      startTime: null,
      requireRefreshTime: 10 * 60 * 1000, // 10m of inactivity
      refreshing: false,
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.currentUser
    },
  },
  mounted() {
    this.startTime = Date.now()
    window.addEventListener('focus', this.checkIfRefreshNeeded)
  },
  beforeDestroy() {
    window.removeEventListener('focus', this.checkIfRefreshNeeded)
  },
  methods: {
    checkIfRefreshNeeded() {
      if (
        this.currentUser &&
        Date.now() - this.startTime > this.requireRefreshTime
      )
        this.refresh()
      this.startTime = Date.now()
    },
    refresh() {
      this.startTime = Date.now()
      console.log('refreshing due to inactivity')
      this.$store.commit('setPauseDbSets', true)
      this.$store.dispatch('logInAs', this.currentUser)
      this.refreshing = true
      setTimeout(() => (this.refreshing = false), 1500)
    },
  },
}
</script>

<style lang="scss" scoped>
.refreshtakeover {
  position: fixed;
  z-index: 2000;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  background: rgba(#fff, 0);
  font-size: 2em;
  transition: 0.5s;

  & > * {
    opacity: 0;
    transition: 0.5s;
  }

  &.on {
    background: rgba(#fff, 0.95);

    & > * {
      opacity: 1;
    }
  }
}
</style>
