<template>
  <section class="app">
    <SetView
      v-if="currentSet"
      :set="currentSet"
    />
  </section>
</template>

<script>
import SetView from './SetView.vue'

export default {
  components: {
    SetView,
  },
  computed: {
    currentSet () { return this.$store.state.currentSet },
  }
}
</script>

<style lang="scss">
html, body {
  margin: 0;
  font-family: 'Avenir', sans-serif;
}


* {
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sub {
  font-size: .85rem;
  opacity: .6;
}

.centertext {
  text-align: center;
}

</style>

