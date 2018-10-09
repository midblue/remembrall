<template>
  <div class="setview">
    <h2>
      <EditableTextField
        :text="set.name"
        :lineBreaksAllowed="false"
				@startEdit="startEditName"
				@endEdit="saveEditedName"
      />
      <div class="sub">
        ({{ set.cards.length }} card{{ set.cards.length === 1 ? '' : 's' }})
      </div>
    </h2>
    <div class="buttonlist">
      <button>+ Add Cards</button>
      <button>Powerups(2) ▾</button>
      <button>Stats</button>
      <button @click="deleteSet">Delete Set</button>
    </div>
    <br />
    <div class="setelements">
      <StudyFrame
        v-bind="set"
      />
      <CardCreator />
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

h2 {
  margin-bottom: .75rem;

  div {
    display: inline-block;
  }
}

.setview {
  width: 500px;
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

