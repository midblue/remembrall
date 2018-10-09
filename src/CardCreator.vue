<template>
  <div
    class="cardcreator"
    :class="{ focus: isFocused }"
  >
    <h4>Add Card</h4>
    <textarea
      ref="front"
      placeholder="Front"
      v-model="front"
      @focus="focus"
    ></textarea>
    <textarea
      placeholder="Back"
      v-model="back"
      @focus="focus"
    ></textarea>
    <button
      @click="newCard"
      @focus="focus"
    >
      <div>Add Card</div>
      <div class="keyicon">⌘-Enter</div>
    </button>
  </div>
</template>

<script>

export default {
  data () {
    return {
      front: '',
      back: '',
      metaDown: false,
    }
  },
  computed: {
    isFocused () { return this.$store.state.appState === 'addCard' },
  }, 
  watch: {
    isFocused (newFocus) {
      if (newFocus) this.$nextTick(() => this.$refs.front.focus())
		}
  },
  mounted () {
		window.addEventListener('keydown', this.keyDown)
		window.addEventListener('keyup', this.keyUp)
	},
	beforeDestroy () {
		window.removeEventListener('keydown', this.keyDown)
		window.removeEventListener('keyup', this.keyUp)
	},
  methods: {
    newCard () {
      if (!this.front || !this.back) return
      this.$store.commit('addCard', {
        front: this.front,
        back: this.back,
        nextReview: 0,
        created: new Date()
      })
      this.front= ''
      this.back = ''
      this.$refs.front.focus()
    },
    focus () {
      this.$store.commit('setAppState', 'addCard')
    },
    blur () {
      this.$store.commit('setAppState', 'study')
    },
    keyDown (event) {
      if (!this.isFocused) return
      if (event.key === 'Meta') this.metaDown = true
			if (event.key === 'Enter' && this.metaDown)
        this.newCard()
    },
    keyUp (event) {
      if (!this.isFocused) return
      if (event.key === 'Meta') this.metaDown = false
    },
  }
}

</script>

<style lang="scss" scoped>

.cardcreator {
  margin: 0 auto;
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

  button {
    width: 100%;
  }
}
</style>

