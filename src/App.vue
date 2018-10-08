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

.keyicon {
  display: inline-block;
  border: 1px solid rgba(black, .3);
  background: rgba(black, .05);
  color: rgba(black, .7);
  text-transform: uppercase;
  font-weight: 600;
  font-size: .7em;
  padding: 1px 5px;
  text-align: center;
  min-width: 18px;
  border-radius: 5px;
  box-shadow: 0 2px 0px rgba(black, .2);
}

button {
  margin: 0;
  border: none;
  background: white;
  font-size: 0.85rem;
  font-weight: 400;
  padding: 10px;
  border-radius: 10px;
  font-family: 'Avenir', sans-serif;
  cursor: pointer;
  transition: .2s;

  &:hover {
    background: #f8f8f8;
  }
}

.buttonlist {
	display: flex;
  border-radius: 10px;
  overflow: hidden;

	button {
		flex: 1;
    border-radius: 0;
	}
}

.roundframe {
  overflow: hidden;
  border-radius: 10px;
}

</style>

