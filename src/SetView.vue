<template>
  <div class="setview">
    <h2>
      <EditableTextField
        :text="set.name"
				@startEdit="startEditName"
				@endEdit="saveEditedName"
      />
    </h2>
    <div>
      <button>Add Card</button>
      <button>Stats</button>
    </div>
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
    editingCard () { return this.$store.state.editingCard },
  },
  methods: {
    startEditName () {
      this.$store.commit('setAppState', 'editSetName')
    },
    saveEditedName (newName) {
      this.$store.commit('updateSetName', newName)
      this.$store.commit('setAppState', 'study')
    },
  }
}
</script>

<style lang="scss" scoped>

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

