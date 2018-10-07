<template>
  <div class="setview">
    <h2>{{ set.name }}</h2>
    <div class="setelements">
      <StudyFrame
        v-bind="set"
      />

      <CardEditor 
        v-if="appState === 'editCard' && editingCard"
        v-bind="editingCard"
      />
      <CardCreator 
        v-else
      />
    </div>
  </div>
</template>

<script>
import CardCreator from './CardCreator.vue'
import CardEditor from './CardEditor.vue'
import StudyFrame from './StudyFrame.vue'

export default {
  props: {
    set: {},
  },
  components: {
    CardEditor,
    CardCreator,
    StudyFrame,
  },
  computed: {
    appState () { return this.$store.state.appState },
    editingCard () { return this.$store.state.editingCard },
  }
}
</script>

<style lang="scss" scoped>

.setview {
  width: 800px;
}

.setelements {
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-gap: 50px;

  & > * {
    width: 100%;
  }
}

</style>

