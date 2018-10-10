<template>
  <div class="setview">
    <h1>
      <EditableTextField
        :text="name"
        :lineBreaksAllowed="false"
				@startEdit="startEditName"
				@endEdit="saveEditedName"
      />
      <div class="sub">
        ({{ cards.length }} card{{ cards.length === 1 ? '' : 's' }})
      </div>
    </h1>
    <div class="buttonlist">
      <button
        :class="{active: appState === 'study'}"
        @click="$store.commit('setAppState', 'study')"
      >Study</button>
      <button 
        :class="{active: appState === 'addCard'}"
        @click="$store.commit('setAppState', 'addCard')"
      >+ Add Card</button>
      <!--<button>Powerups(3) ▾</button>-->
      <button
        :class="{active: appState === 'setStats'}"
        @click="$store.commit('setAppState', 'setStats')"
      >Stats</button>
      <button
        :class="{active: appState === 'setSettings'}"
        @click="$store.commit('setAppState', 'setSettings')"
      >Settings</button>
    </div>
    <br />
    <div class="setelements">
      <CardCreator 
        v-if="appState === 'addCard'"
      />
      <SetSettings
        v-else-if="appState === 'setSettings'"
      />
      <SetStats
        v-else-if="appState === 'setStats'"
      />
      <StudyFrame
        v-else
        :cards="cards"
        @newCard="newCard"
        @reviewCard="reviewCard"
      />
    </div>
  </div>
</template>

<script>
import EditableTextField from './EditableTextField'
import CardCreator from './CardCreator.vue'
import StudyFrame from './StudyFrame.vue'
import SetSettings from './SetSettings.vue'
import SetStats from './SetStats.vue'

export default {
  props: {
    id: {},
    name: {},
    cards: {},
    maxNewPerDay: {
      default: 10,
    },
    maxReviewsPerDay: {
      default: 50,
    },
    lastStudied: {
      default: () => new Date(),
    },
    newToday: {
      default: 0,
    },
    reviewsToday: {
      default: 0,
    }
  },
  components: {
    EditableTextField,
    SetSettings,
    SetStats,
    CardCreator,
    StudyFrame,
  },
  data () {
    return {
      newCardsToday: 0,
      reviewCardsToday: 0,
    }
  },
  computed: {
    appState () { return this.$store.state.appState },
  },
  methods: {
    startEditName () {
      // this.$store.commit('setAppState', 'editSetName')
    },
    saveEditedName (newName) {
      this.$store.commit('updateSetName', newName)
      // this.$store.commit('setAppState', 'study')
    },
    newCard () {

    },
    reviewCard () {

    },
  }
}
</script>

<style lang="scss" scoped>

h1 {
  margin-bottom: .75rem;

  @media (max-width: 768px) {
    margin-top: .5rem;
	}

  div {
    display: inline-block;
  }
}

.setview {
  width: 550px;
  max-width: 100vw;
  padding: 0 20px;
}

.setelements {
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 50px;

  & > * {
    width: 100%;
  }
}

</style>

