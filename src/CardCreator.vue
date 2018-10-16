<template>
  <div
    class="cardcreator"
    :class="{ focus: isFocused }"
  >
    <textarea
      ref="front"
      class="front"
      placeholder="Hint"
      v-model="front"
      @focus="focus"
    ></textarea>
    <textarea
      placeholder="Answer"
      class="back"
      v-model="back"
      @focus="focus"
    ></textarea>

    <FloatingText 
      :text="addText"
      offset="-30"
    />
    <button
      @click="newCard"
    >
      <div>Add Card</div>
      <div class="keyicon">⌘-Enter</div>
    </button>
  </div>
</template>

<script>
import FloatingText from './FloatingText'

export default {
  props: {},
  data() {
    return {
      front: '',
      back: '',
      metaDown: false,
      addText: '',
    }
  },
  components: {
    FloatingText,
  },
  computed: {
    isFocused() {
      return this.$store.state.appState === 'addCard'
    },
  },
  watch: {
    isFocused(newFocus) {
      if (newFocus) this.$nextTick(() => this.$refs.front.focus())
    },
  },
  mounted() {
    window.addEventListener('keydown', this.keyDown)
    window.addEventListener('keyup', this.keyUp)
    this.$store.commit('setAppState', 'addCard')
    this.$nextTick(() => this.$refs.front.focus())
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.keyDown)
    window.removeEventListener('keyup', this.keyUp)
    this.$store.commit('setIsEditingText', false)
  },
  methods: {
    newCard() {
      if (!this.front || !this.back) return
      this.$store.commit('addCard', {
        id: Date.now(),
        front: this.front,
        back: this.back,
        nextReview: 0,
      })
      this.addText = 'Card added.'
      setTimeout(() => (this.addText = ''), 1500)
      this.front = ''
      this.back = ''
      this.$refs.front.focus()
    },
    keyDown(event) {
      if (!this.isFocused) return
      if (event.key === 'Meta') this.metaDown = true
      if (event.key === 'Enter' && this.metaDown) this.newCard()
    },
    keyUp(event) {
      if (!this.isFocused) return
      if (event.key === 'Meta') this.metaDown = false
    },
    focus() {
      this.$store.commit('setIsEditingText', true)
    },
  },
}
</script>

<style lang="scss" scoped>
.cardcreator {
  position: relative;
  margin: 0 auto;
  opacity: 0.3;
  transition: all 0.5s;

  &.focus {
    opacity: 1;
  }

  & > * {
    display: block;
  }

  textarea {
    background: #f8f8f8;
    width: 100%;
    min-height: 150px;
    font-size: 1.3rem;
    border: 1px solid #ddd;
    padding: 20px;
    text-align: center;

    &.front {
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
    }
    &.back {
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;
    }
  }

  button {
    width: 100%;
    margin-top: 20px;
  }
}
</style>
