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
			Created: <b>{{ new Date(currentSet.id).toLocaleDateString() }}</b>
		</p>
		<p>
			Total Reviews: <b>{{ totalReviews }}</b>
		</p>
  </div>
</template>

<script>

export default {
	props: {
		id: {}
	},
	components: {

	},
  data () {
    return {
      
    }
  },
  computed: {
		currentSet () { return this.$store.state.setList[this.$store.state.currentSetId] },
		totalReviews () {
			return this.currentSet.cards.reduce((total, card) => 
				total + (card.totalReviews ? card.totalReviews : 0)
			, 0)
		},
		newCards () {
			return this.currentSet.cards.reduce((total, card) => 
				total + (!card.totalReviews || card.totalReviews === 0 ? 1 : 0)
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

