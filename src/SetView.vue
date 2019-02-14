<template>
  <div class="setview">
    <h1>
      <EditableTextField
        :text="name"
        placeholder="Enter set name"
        :lineBreaksAllowed="false"
        @startEdit="startEditName"
        @endEdit="saveEditedName"
      />
      <div class="sub" v-if="cards">
        ({{ cards.length }} card{{ cards.length === 1 ? '' : 's' }})
      </div>
    </h1>
    <div class="buttonlist">
      <button
        :class="{ active: appState === 'study' || appState === 'editCard' }"
        @click="$store.commit('setAppState', 'study')"
      >
        <div>Study</div>
        <kbd class="keyicon">s</kbd>
      </button>
      <button
        :class="{ active: appState === 'addCard' }"
        @click="$store.commit('setAppState', 'addCard')"
      >
        <div>Add</div>
        <kbd class="keyicon">a</kbd>
      </button>
      <button
        :class="{ active: appState === 'setBrowse' }"
        @click="$store.commit('setAppState', 'setBrowse')"
      >
        <div>Browse</div>
        <kbd class="keyicon">b</kbd>
      </button>
      <button
        :class="{ active: appState === 'setStats' }"
        @click="$store.commit('setAppState', 'setStats')"
      >
        <div>Stats</div>
        <kbd class="keyicon">t</kbd>
      </button>
      <button
        :class="{ active: appState === 'setSettings' }"
        @click="$store.commit('setAppState', 'setSettings')"
      >
        <div>Settings</div>
        <kbd class="keyicon">e</kbd>
      </button>
    </div>
    <br />
    <div class="setelements">
      <CardCreator
        key="add"
        v-if="appState === 'addCard' || (!cards && appState === 'study')"
      />
      <SetBrowser key="browse" v-else-if="appState === 'setBrowse'" />
      <SetSettings key="settings" v-else-if="appState === 'setSettings'" />
      <SetStats key="stats" v-else-if="appState === 'setStats'" />
      <StudyFrame key="study" v-else :cards="cards" />
    </div>
  </div>
</template>

<script>
import EditableTextField from './EditableTextField'
import SetSettings from './SetSettings'
import SetStats from './SetStats'
import CardCreator from './CardCreator'
import StudyFrame from './StudyFrame'
import SetBrowser from './SetBrowser'

export default {
  props: {
    id: {},
    name: {},
    cards: {},
    lastStudied: {
      default: () => new Date(),
    },
    newToday: {
      default: 0,
    },
    reviewsToday: {
      default: 0,
    },
  },
  components: {
    EditableTextField,
    SetSettings,
    SetStats,
    CardCreator,
    StudyFrame,
    SetBrowser,
  },
  data() {
    return {
      newCardsToday: 0,
      reviewCardsToday: 0,
    }
  },
  computed: {
    appState() {
      return this.$store.state.appState
    },
    isEditingText() {
      return this.$store.state.isEditingText
    },
    setList() {
      return this.$store.state.setList
    },
  },
  mounted() {
    window.addEventListener('keyup', this.keyUp)
  },
  beforeDestroy() {
    window.removeEventListener('keyup', this.keyUp)
  },
  methods: {
    startEditName() {
      this.$store.commit('setIsEditingText', true)
    },
    saveEditedName(newName) {
      this.$store.commit('updateSetName', newName)
      this.$store.commit('setIsEditingText', false)
    },
    keyUp(event) {
      if (this.isEditingText) return
      if (event.key === 's') this.$store.commit('setAppState', 'study')
      if (event.key === 'a') this.$store.commit('setAppState', 'addCard')
      if (event.key === 'b') this.$store.commit('setAppState', 'setBrowse')
      if (event.key === 't') this.$store.commit('setAppState', 'setStats')
      if (event.key === 'e') this.$store.commit('setAppState', 'setSettings')
      if (event.key === 'ArrowRight') this.$store.dispatch('goToNextSet')
      if (event.key === 'ArrowLeft') this.$store.dispatch('goToPreviousSet')
    },
  },
}
</script>

<style lang="scss" scoped>
h1 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  height: 2rem;

  div {
    display: inline-block;
  }
}
.padright {
  padding-right: 10px;
}

.setelements {
  // position: relative;

  & > *,
  & > * > * {
    width: 100%;
    // position: absolute;
    // top: 0;
  }
}
</style>
