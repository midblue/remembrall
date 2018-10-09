<template>
  <div
    class="cardeditor"
    :class="{ focus: isFocused }"
  >
    <h4>Edit Card</h4>
    <textarea
			ref="front"
      placeholder="front"
      v-model="newFront"
			@focus="focus"
			@blur="blur"
    ></textarea>
    <textarea
      placeholder="back"
			v-model="newBack"
			@focus="focus"
			@blur="blur"
    ></textarea>
    <button
      @click="commitEdit"
			@focus="focus"
			@blur="blur"
    >Done</button>
  </div>
</template>

<script>

export default {
	props: {
		front: {},
		back: {},
		id: {}
	},
  data () {
    return {
      newFront: '',
      newBack: '',
      metaDown: false,
    }
  },
  computed: {
    isFocused () { return this.$store.state.appState === 'editCard' },
		cardToEdit () { return this.$store.state.editingCard },
  }, 
  mounted () {
		window.addEventListener('keydown', this.keyDown)
		window.addEventListener('keyup', this.keyUp)
		if (!this.cardToEdit) return
		this.newFront = this.cardToEdit.front
		this.newBack = this.cardToEdit.back
		this.$refs.front.focus()
	},
	beforeDestroy () {
		window.removeEventListener('keydown', this.keyDown)
		window.removeEventListener('keyup', this.keyUp)
		this.$store.commit('cardToEditId')
		this.$store.commit('setAppState', 'study')
	},
	watch : {
		id () {
			this.newFront = this.cardToEdit.front
			this.newBack = this.cardToEdit.back
      this.$refs.front.focus()
		}
	},
  methods: {
    commitEdit () {
			const front = this.newFront
				.replace(/^[\s\n]*/g, '')
				.replace(/[\s\n]*$/g, '')
			const back = this.newBack
				.replace(/^[\s\n]*/g, '')
				.replace(/[\s\n]*$/g, '')
      this.$store.commit('updateCard', {
				id: this.id,
				front,
				back,
      })
			this.$store.commit('cardToEditId')
			this.$store.commit('setAppState', 'study')
    },
    focus (e) {
      this.$store.commit('setAppState', 'editCard')
    },
    blur (e) {
			this.$store.commit('cardToEditId')
      this.$store.commit('setAppState', 'study')
    },
    keyDown (event) {
      if (!this.isFocused) return
      if (event.key === 'Meta') this.metaDown = true
			if (event.key === 'Enter' && this.metaDown)
        this.commitEdit()
    },
    keyUp (event) {
      if (!this.isFocused) return
      if (event.key === 'Meta') this.metaDown = false
    },
  }
}

</script>

<style lang="scss" scoped>

.cardeditor {
  margin: 50px auto;
  opacity: .3;
  transition: all .5s;

  &.focus {
    opacity: 1;
  }

  & > * {
    display: block;
  }

  textarea {
    width: 100%;
    height: 100px;
    font-size: 1rem;
  }
}
</style>

