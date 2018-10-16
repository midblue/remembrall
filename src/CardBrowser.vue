<template>
  <div
    class="cardbrowser"
  >
		<input
			class="searchbar"
			@focus="$store.commit('setIsEditingText', true)"
			@blur="$store.commit('setIsEditingText', false)"
			v-model="searchTerm"
			placeholder="Type to filter..."
		/>
    
		<div class="cardlist">
			<div 
				v-for="card in sortedCards"
				:key="card.id"
				class="card"
			>
				<EditableTextField
					class="front"
					:text="card.front"
					@startEdit="startEdit"
					@endEdit="saveEditedCard('front', card.id, ...arguments)"
				/>
				<EditableTextField
					class="back"
					:text="card.back"
					@startEdit="startEdit"
					@endEdit="saveEditedCard('back', card.id, ...arguments)"
				/>
				<div class="stats sub">
					<div v-if="card.ok && card.again && card.ok + card.again > 0">
						Oks: {{ (card.ok || 0) }} ・ Agains: {{ (card.again || 0) }}
					</div>
					<div v-else>
						New
					</div>
				</div>
			</div>
		</div>
		
    <button
      @click="$store.commit('setAppState', 'addCard')"
    >
      <div>Add Card</div>
    </button>
  </div>
</template>

<script>
import FloatingText from './FloatingText'
import EditableTextField from './EditableTextField'

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
    EditableTextField,
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
  mounted() {},
  beforeDestroy() {
    this.$store.commit('setIsEditingText', false)
  },
  methods: {
    startEdit(startText) {
      this.$store.commit('setIsEditingText', true)
      this.initialEditText = startText
    },
    saveEditedCard(side, id, newValue) {
      this.$store.commit('setIsEditingText', false)
      if (this.initialEditText === newValue) return
      this.$store.commit('updateCard', {
        id,
        [side]: newValue,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.cardbrowser {
  position: relative;
  margin: 0 auto;
  transition: all 0.5s;
  margin-bottom: 200px;
  font-size: 1rem;
}

.searchbar {
  width: 100%;
  border-radius: 7px;
  border: 1px solid #ddd;
  font-size: 1.2rem;
  font-family: 'Avenir Neue', 'Avenir', 'Helvetica', sans-serif;
  padding: 10px 10px;
  margin-bottom: 30px;
}

.cardlist {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 25px;
  text-align: center;
  margin-bottom: 20px;

  & > * {
    background: #f8f8f8;
    border-radius: 10px;
    display: flex;
    flex-direction: column;

    .front,
    .back {
      flex: 1;
      padding: 20px;
      border-bottom: 1px solid #e8e8e8;
    }
    .stats {
      padding: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
