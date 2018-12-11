<template>
  <div class="userview">
    <h1>
      All Cards
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
.userview {
  width: 550px;
  max-width: 100vw;
  padding: 0 20px;
  margin-bottom: 50vh;
}
</style>
