<template>
  <div class="cardbrowser">
    <template v-if="sortedCards.length > 0">
      <input
        class="searchbar"
        @focus="$store.commit('setIsEditingText', true)"
        @blur="$store.commit('setIsEditingText', false)"
        ref="searchbar"
        v-model="searchTerm"
        placeholder="Type to filter..."
      />
      <div class="mar-b sub" v-if="sortedCards.length < currentCards.length">
        {{ sortedCards.length }} cards shown.
      </div>

      <div class="cardlist">
        <Card
          v-for="card in sortedCards"
          :key="card.id"
          class="card"
          v-bind="card"
          :forStudy="false"
          :mini="true"
        />
      </div>
    </template>

    <button @click="$store.commit('setAppState', 'addCard')">
      <div>Add Card</div>
    </button>
  </div>
</template>

<script>
import FloatingText from './FloatingText'
import Card from './Card'

export default {
  props: {},
  data() {
    return {
      initialEditText: '',
      searchTerm: '',
      sortBy: '',
    }
  },
  components: {
    FloatingText,
    Card,
  },
  computed: {
    currentCards() {
      return this.$store.state.setList[this.$store.state.currentSetId].cards
    },
    filteredCards() {
      if (!this.searchTerm) return this.currentCards
      return this.currentCards.filter(
        card =>
          card.front.toLowerCase().indexOf(this.searchTerm.toLowerCase()) !==
            -1 ||
          card.back.toLowerCase().indexOf(this.searchTerm.toLowerCase()) !== -1
      )
    },
    sortedCards() {
      return this.filteredCards.sort((a, b) => (a.id > b.id ? -1 : 1))
    },
  },
  watch: {},
  mounted() {
    if (this.$refs.searchbar) this.$nextTick(() => this.$refs.searchbar.focus())
  },
  beforeDestroy() {
    this.$store.commit('setIsEditingText', false)
  },
  methods: {},
}
</script>

<style lang="scss" scoped>
.cardbrowser {
  position: relative;
  margin: 0 auto;
  transition: all 0.5s;
  margin-bottom: 200px;
  font-size: 1rem;

  .searchbar {
    width: 100%;
    border-radius: 7px;
    border: 1px solid #ddd;
    font-size: 1.2rem;
    font-family: 'Avenir Neue', 'Avenir', 'Helvetica', sans-serif;
    padding: 10px 10px;
    margin-bottom: 20px;
  }

  .cardlist {
    display: grid;
    grid-template-columns: 48% 48%;
    grid-gap: 10px 4%;
    text-align: center;
    margin-bottom: 20px;
  }
}

.mar-b {
  margin-bottom: 20px;
}
</style>
