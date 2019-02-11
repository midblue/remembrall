<template>
  <div
    class="userandsetpicker"
    :class="{
      fullscreen: !currentUser || isLoading,
      vertical: !currentUser,
    }"
  >
    <template v-if="!currentUser && !isLoading">
      <div><b>Enter your username.</b></div>
      <div>
        <input
          v-model="inputUsername"
          placeholder="username"
          ref="usernameInput"
        />
      </div>
      <div><button @click="logInAs">Go</button></div>
    </template>
    <template v-else-if="isLoading">
      <div class="sub">Loading...</div>
    </template>
    <template v-else>
      <div class="buttonlist fullheight inlineblock" v-if="!isMobile">
        <button
          v-for="set in setList"
          :key="set.id"
          :class="{
            active:
              parseInt(currentSetId) === parseInt(set.id) &&
              appState !== 'user',
            // duecards: dueReviews[set.id] > 0,
          }"
          @click="switchSet(set.id)"
        >
          {{ set.name }}
          <span
            v-if="
              !isMobile &&
                dueReviews[set.id] > 0 &&
                (parseInt(currentSetId) !== parseInt(set.id) ||
                  appState === 'user')
            "
            class="sub"
          >
            ({{ dueReviews[set.id] }})
          </span></button
        ><button @click="$store.commit('addSet')">+ Add Set</button>
      </div>
      <div v-else class="buttonlist fullheight" ref="mainButton">
        <button
          v-if="appState === 'user'"
          class="mainbutton"
          @click="$store.commit('setAppState', 'study')"
        >
          ← Back to Studying
        </button>
        <button
          v-else
          :key="setList[currentSetId].id"
          class="mainbutton"
          :class="{ open: setPickerOpen }"
          style="position: relative;"
          @click="setPickerOpen = !setPickerOpen"
        >
          {{ setList[currentSetId].name }} ▾
          <div class="secondarypanel" v-if="setPickerOpen">
            <button
              v-for="set in setList"
              v-if="set.id != currentSetId"
              @key="set.id"
              @click="switchSet(set.id)"
              :class="{
                duecards: dueReviews[set.id] > 0,
              }"
            >
              {{ set.name }}
            </button>
            <button @click="$store.commit('addSet')">+ Add Set</button>
          </div>
        </button>
      </div>

      <div class="flex-ai">
        <div class="buttonlist fullheight inlineblock">
          <button
            @click="$store.commit('setAppState', 'user')"
            :class="{ active: appState === 'user' }"
          >
            {{ currentUser }}</button
          ><button @click="logOut">Log out</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
const { get } = require('./assets/storage')

export default {
  props: {},
  components: {},
  data() {
    return {
      isLoading: false,
      inputUsername: '',
      dueReviews: {},
      setPickerOpen: false,
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.currentUser
    },
    appState() {
      return this.$store.state.appState
    },
    setList() {
      return this.$store.state.setList
    },
    currentSetId() {
      return this.$store.state.currentSetId
    },
    currentCards() {
      return this.$store.state.setList[this.$store.state.currentSetId]
        ? this.$store.state.setList[this.$store.state.currentSetId].cards
        : []
    },
    isMobile() {
      return this.$store.state.isMobile
    },
    appState() {
      return this.$store.state.appState
    },
  },
  watch: {
    currentUser(newUser) {
      this.isLoading = false
      const savedSetId = get('currentSetId')
      if (savedSetId && savedSetId !== '') {
        this.$store.commit('setCurrentSetId', savedSetId)
      }
      if (!newUser) this.$nextTick(this.focusInput)
    },
    setList() {
      this.isLoading = false
      this.updateDueReviews()
    },
    currentCards() {
      this.updateDueReviews()
    },
    currentSetId() {
      this.isLoading = false
      this.updateDueReviews()
    },
    setPickerOpen(opening) {
      if (opening) window.addEventListener('click', this.checkClickToClose)
      else window.removeEventListener('click', this.checkClickToClose)
    },
  },
  mounted() {
    window.addEventListener('keydown', this.keyDown)
    this.updateDueReviews()
    window.setInterval(this.updateDueReviews, 10 * 60 * 1000)
    const savedUsername = get('currentUser')
    if (savedUsername && savedUsername !== '') {
      this.$store.dispatch('logInAs', savedUsername)
      this.isLoading = true
    } else {
      this.$nextTick(this.focusInput)
    }
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.keyDown)
  },
  methods: {
    logInAs() {
      if (this.inputUserName === '') return
      this.isLoading = true
      this.$store.dispatch('logInAs', this.inputUsername)
    },
    logOut() {
      this.$store.commit('logOut')
    },
    keyDown(event) {
      if (this.currentUser) return this.updateDueReviews()
      if (event.key === 'Enter') this.logInAs()
    },
    focusInput() {
      this.$refs.usernameInput.focus()
    },
    switchSet(id) {
      this.$store.commit('setAppState', 'study') // app hangs if it stays on settings
      this.$store.commit('setCurrentSetId', id)
    },
    updateDueReviews() {
      const now = Date.now()
      this.dueReviews = {}
      for (let set in this.setList) {
        if (
          new Date(this.setList[set].lastUpdated).getDate() !==
          new Date().getDate()
        ) {
          this.$store.commit('resetSetDay', set)
        }
        const maxNew = this.setList[set].settings
          ? this.setList[set].settings.maxNewPerDay
          : 999999
        const newToday = this.setList[set].newToday
        if (!this.setList[set].cards) return (this.dueReviews[set] = 0)
        const dueInDeck = Math.min(
          this.setList[set].cards.reduce(
            (dueCount, card) =>
              card.nextReview < now &&
              card.totalReviews &&
              card.totalReviews > 0 &&
              !card.suspended
                ? dueCount + 1
                : dueCount,
            0
          ),
          this.setList[set].settings &&
            this.setList[set].settings.maxReviewsPerDay
            ? this.setList[set].settings.maxReviewsPerDay -
                this.setList[set].reviewsToday
            : 999999
        )
        const newInDeck = this.setList[set].cards.reduce(
          (dueCount, card) =>
            (!card.totalReviews || card.totalReviews === 0) && !card.suspended
              ? dueCount + 1
              : dueCount,
          0
        )
        this.dueReviews[set] =
          dueInDeck + Math.min(maxNew - Math.min(newToday, maxNew), newInDeck)
      }
    },
    checkClickToClose(e) {
      console.log(e.path)
      if (!e.path.includes(this.$refs.mainButton)) this.setPickerOpen = false
    },
  },
}
</script>

<style lang="scss" scoped>
.userandsetpicker {
  padding: 0 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: #ddd;
  margin-bottom: 30px;
  height: 50px;
  transition: 0.5s;
  position: relative;
  z-index: 10;

  @media (max-width: 768px) {
    padding: 0 20px;
  }

  &.fullscreen {
    height: 100vh;
    position: fixed;
    justify-content: center;
  }

  &.vertical {
    flex-direction: column;

    & > * {
      margin-bottom: 20px;
    }
  }
}

button:not(.active).duecards {
  background: #fd8;
}

.inlineblock {
  display: inline-block;
}

.flex-ai {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.buttonlist {
  overflow: visible;

  &.fullheight {
    border-radius: 0;
    border: none;
    height: 100%;

    button {
      background: rgba(white, 0);
      box-shadow: none;
      border: none;
      transition: background 0.2s;
      padding-left: 15px;
      padding-right: 15px;

      &.active {
        background: white;
      }

      &:hover {
        background: rgba(white, 0.5);
      }
    }

    & > * {
      height: 100%;
      border-radius: 0;
    }
  }
}

button.mainbutton {
  position: relative;
  z-index: 100;
  min-width: 20vw;
  box-shadow: 0 0 1000px 1000px rgba(black, 0);
  transition: box-shadow 0.3s;
}

button.open {
  border-bottom-right-radius: 0px !important;
  border-bottom-left-radius: 0px !important;
  box-shadow: 0 0 1000px 1000px rgba(black, 0.3);
  background: white !important;
}

.secondarypanel {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: #eee;

  button {
    width: 100%;
    border-radius: 0;
    border: 0;
    border-top: 1px solid #eee;
    // box-shadow: 0 0 0 1px #eee;

    &:first-of-type {
      border-radius: 0;
    }

    &:last-of-type {
      border-radius: 0;
      border-bottom-right-radius: 10px;
      border-bottom-left-radius: 10px;
    }
  }
}
</style>
