<template>
  <div class="stats">
    <p>
      Cards: <b>{{ currentSet.cards.length }}</b>
    </p>
    <p>
      Mastered Cards: <b>{{ masteredCards }}</b>
      <span class="sub"
        >({{
          Math.round((masteredCards / currentSet.cards.length) * 100)
        }}%)</span
      >
    </p>
    <p>
      New Cards: <b>{{ newCards }}</b>
    </p>
    <p>
      Deck Created:
      <b>{{ new Date(parseInt(currentSet.id)).toLocaleDateString() }}</b>
    </p>
    <p>
      Total Reviews: <b>{{ totalReviews }}</b>
    </p>
    <p>
      Success Rate:
      <b
        >{{
          oks && agains ? Math.round((oks / (agains + oks)) * 10000) / 100 : 0
        }}%</b
      >
      <span class="sub" v-if="oks && agains"
        >({{ oks }} oks / {{ agains }} agains)</span
      >
    </p>
    <ReviewGraph :cards="currentSet.cards" />
  </div>
</template>

<script>
import ReviewGraph from './ReviewGraph'

export default {
  props: {
    id: {},
  },
  components: {
    ReviewGraph,
  },
  data() {
    return {}
  },
  computed: {
    currentSet() {
      return this.$store.state.setList[this.$store.state.currentSetId]
    },
    totalReviews() {
      return this.oks + this.agains
    },
    newCards() {
      return this.currentSet.cards.reduce(
        (total, card) =>
          total + (!card.totalReviews || card.totalReviews === 0 ? 1 : 0),
        0
      )
    },
    oks() {
      return this.currentSet.cards.reduce(
        (total, card) => total + (card.ok ? card.ok : 0),
        0
      )
    },
    agains() {
      return this.currentSet.cards.reduce(
        (total, card) => total + (card.again ? card.again : 0),
        0
      )
    },
    masteredCards() {
      return this.currentSet.cards.reduce(
        (total, card) =>
          total +
          (card.ok
            ? card.ok > 5 && card.ok / (card.again ? card.again : 0) > 4
              ? 1
              : 0
            : 0),
        0
      )
    },
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  methods: {},
}
</script>

<style lang="scss" scoped></style>
