<template>
  <div class="browser">
    <input
      class="searchbar"
      @focus="$store.commit('setIsEditingText', true)"
      @blur="$store.commit('setIsEditingText', false)"
      ref="searchbar"
      v-model="searchTerm"
      placeholder="Type to filter..."
    />
    <div class="buttonlist">
      <select v-model="typeFilter">
        <option value="all">All Cards</option>
        <option value="new">New</option>
        <option value="notnew">Not New</option>
        <option value="mastered">Mastered</option>
        <option value="suspended">Suspended</option>
        <option value="notsuspended">Not Suspended</option>
      </select>
      <select v-model="setFilter" v-if="Object.keys(allPresentSets).length > 1">
        <option value="all">All Sets</option>
        <option v-for="set in allPresentSets" :key="set.id" :value="set.id">{{
          set.name
        }}</option>
      </select>
    </div>
    <br />

    <template v-if="filteredCards.length">
      <CardInline
        v-if="inline"
        v-for="card in clampedCards"
        :key="card.id"
        v-bind="card"
      />
      <div v-if="!inline" class="twoupcardlist">
        <Card
          v-for="card in clampedCards"
          :key="card.id"
          class="card"
          v-bind="card"
          :forStudy="false"
          :mini="true"
        />
      </div>
    </template>
    <div v-else>
      <br />
      <center>No cards to show here!</center>
    </div>
  </div>
</template>

<script>
import CardInline from './CardInline'
import Card from './Card'

export default {
  props: {
    cards: {
      default: [],
    },
    inline: {
      default: false,
    },
  },
  components: {
    CardInline,
    Card,
  },
  data() {
    return {
      shownCount: this.inline ? 40 : 20,
      typeFilter: 'all',
      setFilter: 'all',
      searchTerm: '',
    }
  },
  computed: {
    allPresentSets() {
      return Object.keys(this.$store.state.setList)
        .filter(setId => this.cards.find(card => card.set === parseInt(setId)))
        .map(setId => ({
          id: parseInt(setId),
          name: this.$store.state.setList[setId].name,
        }))
    },
    sortedCards() {
      return this.cards.sort((a, b) => b.id - a.id)
    },
    filteredCards() {
      return this.sortedCards
        .filter(card => this.setFilter === 'all' || this.setFilter === card.set)
        .filter(
          card =>
            !this.searchTerm ||
            card.front.toLowerCase().indexOf(this.searchTerm.toLowerCase()) !==
              -1 ||
            card.back.toLowerCase().indexOf(this.searchTerm.toLowerCase()) !==
              -1
        )
        .filter(card => {
          if (
            this.typeFilter === 'all' ||
            (this.typeFilter === 'new' &&
              (!card.totalReviews || card.totalReviews === 0)) ||
            (this.typeFilter === 'notnew' &&
              card.totalReviews &&
              card.totalReviews > 0) ||
            (this.typeFilter === 'mastered' &&
              card.ok &&
              card.ok > 5 &&
              card.ok / (card.again ? card.again : 0) > 4) ||
            (this.typeFilter === 'suspended' && card.suspended) ||
            (this.typeFilter === 'notsuspended' && !card.suspended)
          )
            return true
          return false
        })
    },
    clampedCards() {
      return this.filteredCards.slice(0, this.shownCount)
    },
  },
  mounted() {
    if (this.$refs.searchbar) this.$nextTick(() => this.$refs.searchbar.focus())
    window.addEventListener('scroll', this.scroll)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.scroll)
  },
  methods: {
    showMore() {
      if (this.shownCount < this.cards.length) this.shownCount += 20
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
      if (scrollPos - window.pageYOffset < 500) this.showMore()
    },
  },
}
</script>

<style lang="scss" scoped>
.browser {
  width: 100%;
}

.searchbar {
  width: 100%;
  border-radius: 7px;
  border: 1px solid #eee;
  font-size: 1.2rem;
  font-family: 'Avenir Neue', 'Avenir', 'Helvetica', sans-serif;
  padding: 10px 10px;
  margin-bottom: 10px;
}

.twoupcardlist {
  display: grid;
  grid-template-columns: 48% 48%;
  grid-gap: 10px 4%;
  text-align: center;
}
</style>
