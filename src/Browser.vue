<template>
  <div class="browser">
    <div class="tools">
      <input
        class="searchbar"
        @focus="$store.commit('setIsEditingText', true)"
        @blur="$store.commit('setIsEditingText', false)"
        ref="searchbar"
        v-model="searchTerm"
        placeholder="Type to filter..."
      />
      <div class="buttonlist">
        <select v-model="sortBy">
          <option value="newest">{{ isMobile ? '' : 'Sort by ' }}Newest</option>
          <option value="oldest">{{ isMobile ? '' : 'Sort by ' }}Oldest</option>
          <option value="sets" v-if="allPresentSets.length > 1"
            >{{ isMobile ? 'By ' : 'Sort by ' }}Set</option
          >
        </select>
        <select v-model="typeFilter">
          <option value="all">All Cards</option>
          <option value="new">New</option>
          <option value="notnew">Not New</option>
          <option value="mastered">Mastered</option>
          <option value="trouble">Trouble</option>
          <option value="suspended">Suspended</option>
          <option value="notsuspended">Not Suspended</option>
        </select>
        <select v-model="setFilter" v-if="allPresentSets.length > 1">
          <option value="all">All Sets</option>
          <option v-for="set in allPresentSets" :key="set.id" :value="set.id">{{
            set.name
          }}</option>
        </select>
      </div>

      <template v-if="selectedCards.length">
        <div class="buttonlist withoverflow">
          <button @click="deselectAll">
            Deselect{{ isMobile ? '' : ' All' }}
          </button>
          <Dropdown
            :label="
              `Move ${!isMobile ? selectedCards.length : ''} Card${
                selectedCards.length === 1 ? '' : 's'
              }`
            "
          >
            <div
              v-for="set in $store.state.setList"
              class="button"
              @key="set.id"
              @click="moveAll(set.id)"
            >
              {{ set.name }}
            </div>
          </Dropdown>
          <button @click="suspendAll">
            Un/Suspend<span v-if="!isMobile">
              {{ selectedCards.length }} Card{{
                selectedCards.length === 1 ? '' : 's'
              }}</span
            >
          </button>
          <button @click="deleteAll">
            Delete<span v-if="!isMobile">
              {{ selectedCards.length }} Card{{
                selectedCards.length === 1 ? '' : 's'
              }}</span
            >
          </button>
        </div>
      </template>
    </div>

    <template v-if="filteredCards.length">
      <CardInline
        v-if="inline"
        v-for="card in clampedCards"
        :key="card.id"
        v-bind="card"
        :forceDeselect="forceDeselect"
        :showSet="allPresentSets.length > 1"
        @select="select"
        @deselect="deselect"
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
import Dropdown from './Dropdown'

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
    Dropdown,
  },
  data() {
    return {
      shownCount: this.inline ? 40 : 20,
      typeFilter: 'all',
      setFilter: 'all',
      sortBy: 'newest',
      searchTerm: '',
      selectedCards: [],
      forceDeselect: false,
    }
  },
  computed: {
    isMobile() {
      return this.$store.state.isMobile
    },
    allPresentSets() {
      return Object.keys(this.$store.state.setList)
        .filter(setId => this.cards.find(card => card.set === parseInt(setId)))
        .map(setId => ({
          id: parseInt(setId),
          name: this.$store.state.setList[setId].name,
        }))
    },
    sortedCards() {
      return this.cards.sort((a, b) =>
        this.sortBy === 'oldest'
          ? a.id - b.id
          : this.sortBy === 'sets'
          ? b.set - a.set
          : b.id - a.id
      )
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
            (this.typeFilter === 'trouble' &&
              card.again &&
              card.again > 3 &&
              card.again / (card.ok ? card.ok : 0) >= 0.5) ||
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
    select(cardId) {
      const foundCard = this.cards.find(card => card.id === cardId)
      if (!foundCard)
        return console.log('Unable to find card to check by the id', cardId)
      this.selectedCards.push(foundCard)
    },
    deselect(cardId) {
      const preLength = this.selectedCards.length
      this.selectedCards = this.selectedCards.filter(card => card.id !== cardId)
      if (this.selectedCards.length !== preLength - 1)
        console.log('Unable to find card', cardId, 'to deselect.')
    },
    deselectAll() {
      this.selectedCards = []
      this.forceDeselect = false
      this.$nextTick(() => (this.forceDeselect = true))
    },
    moveAll(toSet) {
      this.selectedCards.forEach(card => {
        this.$store.commit('moveCard', {
          id: card.id,
          from: card.set,
          to: toSet,
        })
      })
    },
    suspendAll() {
      const alreadySuspended = this.selectedCards[0].suspended
      this.selectedCards.forEach(card => {
        this.$store.commit('updateCard', {
          id: card.id,
          suspended: !alreadySuspended,
        })
      })
    },
    deleteAll() {
      if (
        !confirm(
          `Are you sure you want to delete ${this.selectedCards.length} card${
            this.selectedCards.length === 1 ? '' : 's'
          }?`
        )
      )
        return
      this.selectedCards.forEach(card => {
        this.$store.commit('deleteCard', card.id)
      })
      this.selectedCards = []
    },
  },
}
</script>

<style lang="scss" scoped>
.browser {
  width: 100%;
}

.tools {
  position: sticky;
  padding: 10px 0 1px 0;
  top: 0;
  z-index: 1000;
  background: white;
}

.buttonlist {
  margin-bottom: 10px;
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
