<template>
  <div class="refreshtakeover" :class="{ on: pauseDbSets }">
    <span>Loading data...</span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      startTime: null,
      requireRefreshTime: 5 * 60 * 1000, // 5m of inactivity
      refreshing: false,
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.currentUser
    },
    pauseDbSets() {
      return this.$store.state.pauseDbSets
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
      this.$store.commit('setPauseDbSets', true)
      this.$store.dispatch('logInAs', this.currentUser)
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
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  background: rgba(#fff, 0);
  font-size: 1.5em;
  transition: 0.4s;

  & > * {
    opacity: 0;
    transition: 0.4s;
  }

  &.on {
    pointer-events: auto;
    background: rgba(#fff, 0.95);

    & > * {
      opacity: 1;
    }
  }
}
</style>
