<template>
  <section class="app">
    <UserAndSetPicker />
    <div class="content">
      <SetView
        v-if="currentSet"
        :set="currentSet"
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
  border-radius: 10px;
  overflow: hidden;

	button {
		flex: 1;
    border-radius: 0;

    &:last-of-type {
      border-top-right-radius: 10px;
      border-bottom-right-radius: 10px;
    }

    &:first-of-type {
      border-top-left-radius: 10px;
      border-bottom-left-radius: 10px;
    }
    
    &:not(:last-of-type) {
      border-right: none;
    }
	}
}

.roundframe {
  overflow: hidden;
  border-radius: 10px;
}

</style>

