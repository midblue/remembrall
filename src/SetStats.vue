<template>
  <div
    class="stats"
  >
		<p>
			Cards: <b>{{ currentSet.cards.length }}</b>
		</p>
		<p>
			New Cards: <b>{{ newCards }}</b>
		</p>
		<p>
			Deck Created: <b>{{ new Date(currentSet.id).toLocaleDateString() }}</b>
		</p>
		<p>
			Total Reviews: <b>{{ totalReviews }}</b>
		</p>
		<p>
			Ok/Again Ratio: <b>{{ (oks / agains).toFixed(3) }}</b> <span class="sub">({{ oks }} oks / {{ agains }} agains)</span>
		</p>
		<ReviewGraph
			:cards="currentSet.cards"
		/>
  </div>
</template>

<script>
import ReviewGraph from './ReviewGraph'

export default {
	props: {
		id: {}
	},
	components: {
		ReviewGraph,
	},
  data () {
    return {
      
    }
  },
  computed: {
		currentSet () { return this.$store.state.setList[this.$store.state.currentSetId] },
		totalReviews () {
			return this.oks + this.agains
		},
		newCards () {
			return this.currentSet.cards.reduce((total, card) => 
				total + (!card.totalReviews || card.totalReviews === 0 ? 1 : 0)
			, 0)
		},
		oks () {
			return this.currentSet.cards.reduce((total, card) => 
				total + (card.ok ? card.ok : 0)
			, 0)
		},
		agains () {
			return this.currentSet.cards.reduce((total, card) => 
				total + (card.again ? card.again : 0)
			, 0)
		}
  }, 
  mounted () {
		
	},
	beforeDestroy () {
		
	},
	watch : {
	},
  methods: {
  }
}

</script>

<style lang="scss" scoped>

</style>

