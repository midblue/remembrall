<template>
  <section class="app">
    <UserAndSetPicker />
    <div class="content">
      <SetView
        v-if="currentSet"
        v-bind="currentSet"
      />
    </div>
  </section>
</template>

<script>
import UserAndSetPicker from './UserAndSetPicker.vue'
import SetView from './SetView.vue'

export default {
  components: {
    SetView, UserAndSetPicker,
  },
  computed: {
    currentSet () { return this.$store.state.setList[this.$store.state.currentSetId] },
  },
  mounted () {
    window.addEventListener('resize', this.checkWidth)
    this.checkWidth()
  },
  methods: {
    checkWidth () {
      this.$store.commit('setAppWidth', window.innerWidth)
    },
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
}

.content {
  display: flex;
  flex-direction: column;
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
  border-radius: 4px;
  box-shadow: 0 2px 0px rgba(black, .2);
  margin-bottom: 2px;

  @media (max-width: 768px) {
    display: none;
	}
}

button {
  margin: 0;
  border: 1px solid #eee;
  background: white;
  font-size: 0.85rem;
  font-weight: 400;
  padding: 10px;
  border-radius: 10px;
  font-family: 'Avenir', sans-serif;
  cursor: pointer;
  transition: .2s;

  &:hover, &.active {
    background: #f8f8f8;
    border: 1px solid transparent;
  }
}

.buttonlist {
	display: flex;
  flex-wrap: wrap;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #eee;

	button {
		flex-grow: 1;
    flex-shrink: 0;
    border-radius: 0;
    outline:0;
    border: none;
    box-shadow: inset -1px -1px 0 0 #eee;
	}
}

.roundframe {
  overflow: hidden;
  border-radius: 10px;
}

</style>

