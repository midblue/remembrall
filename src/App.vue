<template>
  <section class="app">
    <UserAndSetPicker />
    <RefreshHandler />
    <div class="content">
      <SetView
        v-if="currentSet"
        :key="currentSet.id"
        :id="currentSet.id"
        :name="currentSet.name"
        :cards="currentSet.cards"
        :lastStudied="currentSet.lastStudied"
        :newToday="currentSet.newToday"
        :reviewsToday="currentSet.reviewsToday"
      />
    </div>
  </section>
</template>

<script>
import UserAndSetPicker from './UserAndSetPicker.vue'
import RefreshHandler from './RefreshHandler.vue'
import SetView from './SetView.vue'

export default {
  components: {
    SetView,
    UserAndSetPicker,
    RefreshHandler,
  },
  computed: {
    currentSet() {
      return this.$store.state.setList[this.$store.state.currentSetId]
    },
  },
  mounted() {
    this.$nextTick(() => this.$el.focus())
    window.addEventListener('resize', this.checkWidth)
    this.checkWidth()
  },
  methods: {
    checkWidth() {
      this.$store.commit('setAppWidth', window.innerWidth)
    },
  },
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Raleway');

html,
body {
  margin: 0;
  font-family: 'Avenir Neue', 'Avenir', 'Raleway', 'Helvetica', sans-serif;
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

a,
a:active,
a:hover,
a:visited {
  color: #555;
}

.sub {
  font-size: 0.85rem;
  opacity: 0.6;
}

.centertext {
  text-align: center;
}

.keyicon {
  display: inline-block;
  border: 1px solid rgba(black, 0.3);
  background: rgba(black, 0.05);
  color: rgba(black, 0.7);
  text-transform: uppercase;
  font-weight: 600;
  font-size: 0.7em;
  padding: 1px 5px;
  text-align: center;
  min-width: 18px;
  border-radius: 4px;
  box-shadow: 0 2px 0px rgba(black, 0.2);
  margin-bottom: 2px;

  @media (max-width: 768px) {
    display: none;
  }
}

.visibletextfield {
  background: white;
  border: 1px solid #bbb;
  border-radius: 5px;
  text-align: center;
  padding: 5px 0;
  position: relative;
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
  transition: 0.2s;

  &:hover,
  &.active {
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
    outline: 0;
    border: none;
    box-shadow: inset -1px -1px 0 0 #eee;
  }

  &.primary button {
    font-size: 1rem;
    padding: 15px;
  }
}

select {
  border: 1px solid #bbb;
  background: white;
  font-size: 1rem;
  font-family: 'Avenir Neue', 'Avenir', 'Helvetica', sans-serif;
  height: 37px;
}

.roundframe {
  overflow: hidden;
  border-radius: 10px;
}
</style>
