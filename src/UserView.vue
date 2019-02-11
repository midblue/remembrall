<template>
  <div class="userview">
    <h1>
      All Cards
      <span class="sub">({{ allCards.length }} total cards)</span>
      <!--
        <span class="sub">
          ({{ filteredCards.length
          }}{{
            filteredCards.length < allCards.length ? ' / ' + allCards.length : ''
          }}
          card{{ filteredCards.length === 1 ? '' : 's'
          }}{{ filteredCards.length < allCards.length ? ' shown' : '' }})
        </span>
      -->
    </h1>
    <Browser :cards="allCards" :inline="true" />
  </div>
</template>

<script>
import Browser from './Browser'

export default {
  props: {},
  components: {
    Browser,
  },
  computed: {
    allSets() {
      return this.$store.state.setList
    },
    allCards() {
      const allCards = []
      for (let set in this.allSets) {
        allCards.push(...this.allSets[set].cards)
      }
      return allCards
    },
  },
}
</script>

<style lang="scss" scoped>
h1 {
  margin-top: 0;
  margin-bottom: 0.75rem;
}
</style>
