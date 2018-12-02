<template>
  <div class="userview">
    <CardInline v-for="card in allCards" :key="card.id" v-bind="card" />
  </div>
</template>

<script>
import CardInline from './CardInline'

export default {
  props: {},
  components: {
    CardInline,
  },
  data() {
    return {}
  },
  computed: {
    appState() {
      return this.$store.state.appState
    },
    allCards() {
      const allSets = this.$store.state.setList
      const allCards = []
      for (let set in allSets) {
        allCards.push(
          ...allSets[set].cards.map(card => {
            card.setName = allSets[set].name
            return card
          })
        )
      }
      return allCards.sort((a, b) => b.id - a.id)
    },
  },
}
</script>

<style lang="scss" scoped>
.userview {
  width: 550px;
  max-width: 100vw;
  padding: 0 20px;
  margin-bottom: 50vh;
}
</style>
