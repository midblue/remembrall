<template>
  <section class="app" :class="{ mobile: isMobile }">
    <UserAndSetPicker />
    <RefreshHandler />
    <div class="content">
      <transition-group appear name="list" tag="div">
        <div
          key="nosets"
          v-if="
            Object.keys($store.state.setList).length === 0 &&
              appState !== 'user'
          "
        >
          <center><h1 style="margin: 50px auto">No sets yet!</h1></center>
          <div class="buttonlist">
            <button @click="$store.commit('addSet')">
              + Add Your First Set
            </button>
          </div>
        </div>
        <SetView
          v-if="currentSet && appState !== 'user'"
          :key="currentSet.id"
          :id="currentSet.id"
          :name="currentSet.name"
          :cards="currentSet.cards"
          :lastStudied="currentSet.lastStudied"
          :newToday="currentSet.newToday"
          :reviewsToday="currentSet.reviewsToday"
        />
        <UserView v-if="appState === 'user' && currentUser" key="user" />
      </transition-group>
    </div>
  </section>
</template>

<script>
import SetView from './SetView'
import UserView from './UserView'
import UserAndSetPicker from './UserAndSetPicker'
import RefreshHandler from './RefreshHandler'

export default {
  components: {
    SetView,
    UserView,
    UserAndSetPicker,
    RefreshHandler,
  },
  computed: {
    isMobile() {
      return this.$store.state.isMobile
    },
    currentUser() {
      return this.$store.state.currentUser
    },
    currentSet() {
      return this.$store.state.setList[this.$store.state.currentSetId]
    },
    appState() {
      return this.$store.state.appState
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
  scroll-behavior: smooth;
}

* {
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  width: 100%;
  position: absolute;
  top: 0;

  &.mobile {
    font-size: 14.5px;
  }
}

.content {
  position: relative;
  width: 650px;
  padding: 0 7vw;
  margin: 40px auto 20vh auto;
  max-width: 100%;

  @media (max-width: 768px) {
    margin-top: 30px;
  }

  & > div {
    width: 100%;
    position: relative;
  }
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
  font-weight: 500;
}
.fade {
  opacity: 0.6;
}

.centertext {
  text-align: center;
}

.keyicon {
  font-family: 'Avenir Neue', 'Avenir', 'Raleway', 'Helvetica', sans-serif;
  display: inline-block;
  border: 1px solid rgba(black, 0.3);
  background: rgba(black, 0.05);
  color: rgba(black, 0.7);
  text-transform: uppercase;
  line-height: 1;
  font-weight: 600;
  font-size: 0.7em;
  padding: 2px 4px;
  text-align: center;
  min-width: 16px;
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
  border: 1px solid rgba(black, 0.1);
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
  border-radius: 10px;
  overflow: visible;
  border: 1px solid rgba(black, 0.1);
  border-bottom: 3px solid rgba(black, 0.1);
  // border-right: 2px solid rgba(black, 0.1);
  flex-wrap: nowrap;

  button,
  select {
    flex-grow: 1;
    flex-shrink: 0;
    border-radius: 0;
    outline: 0;
    border: none;
    box-shadow: inset -1px -1px 0 0 rgba(black, 0.1);
    position: relative;
    overflow: visible;

    &:first-of-type {
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;
    }
    &:last-of-type {
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
      border-right: none;
    }
  }

  select {
    padding-left: 15px;
    appearance: none;
    background-image: url("data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='24' height='24' viewBox='0 0 24 24'><path fill='#444' d='M7.406 7.828l4.594 4.594 4.594-4.594 1.406 1.406-6 6-6-6z'></path></svg>");
    background-position: 98% 50%;
    background-repeat: no-repeat;
  }

  &.primary button,
  &.primary select {
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

.list-enter-active,
.list-leave-active {
  transition: all 0.25s;
  position: absolute;
  top: 0;
  width: 100%;
}
.list-leave-active {
  transition: all 0.1s;
}
.list-enter,
.list-leave-to {
  opacity: 0;
}
</style>
