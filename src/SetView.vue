<template>
  <div class="setview">
    <h1>
      <EditableTextField
        :text="set.name"
        :lineBreaksAllowed="false"
				@startEdit="startEditName"
				@endEdit="saveEditedName"
      />
      <div class="sub">
        ({{ set.cards.length }} card{{ set.cards.length === 1 ? '' : 's' }})
      </div>
    </h1>
    <div class="buttonlist">
      <button 
        v-if="appState !== 'addCard'"
        @click="$store.commit('setAppState', 'addCard')"
      >+ Add Cards</button>
      <button
        v-else
        @click="$store.commit('setAppState', 'study')"
      >Study</button>
      <button>Powerups(3) ▾</button>
      <button>Stats</button>
      <button @click="deleteSet">Delete Set</button>
    </div>
    <br />
    <div class="setelements">
      <CardCreator 
        v-if="appState === 'addCard'"
      />
      <StudyFrame
        v-bind="set"
        v-else
      />
    </div>
  </div>
</template>

<script>
import EditableTextField from './EditableTextField'
import CardCreator from './CardCreator.vue'
import CardEditor from './CardEditor.vue'
import StudyFrame from './StudyFrame.vue'

export default {
  props: {
    set: {},
  },
  components: {
    EditableTextField,
    CardEditor,
    CardCreator,
    StudyFrame,
  },
  data () {
    return {
    }
  },
  computed: {
    appState () { return this.$store.state.appState },
  },
  methods: {
    startEditName () {
      this.$store.commit('setAppState', 'editSetName')
    },
    saveEditedName (newName) {
      this.$store.commit('updateSetName', newName)
      this.$store.commit('setAppState', 'study')
    },
    deleteSet () {
      if (confirm(`Do you really want to delete the set "${ this.set.name }"?`))
        this.$store.commit('deleteSet', this.set.id)
    }
  }
}
</script>

<style lang="scss" scoped>

h1 {
  margin-bottom: .75rem;

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

