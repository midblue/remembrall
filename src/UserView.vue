<template>
  <div class="userview">
    <CardInline
      v-if="allCards.length > 0"
      v-for="card in clampedCards"
      :key="card.id"
      v-bind="card"
    />
    <div v-else>No cards yet! Add some to a set to see them here.</div>
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
    return { shownCount: 40 }
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
    clampedCards() {
      return this.allCards.slice(0, this.shownCount)
    },
  },
  mounted() {
    window.addEventListener('scroll', this.scroll)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.scroll)
  },
  methods: {
    showMore() {
      if (this.shownCount < this.allCards.length) this.shownCount += 20
    },
    scroll() {
      const scrollPos =
        Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        ) - window.innerHeight
      console.log(window.pageYOffset, scrollPos)
      if (scrollPos - window.pageYOffset < 500) this.showMore()
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
