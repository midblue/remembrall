<template>
  <div
    class="cardcreator"
  >

    <EditableTextField
      class="textfield front"
      :class="{duplicate: isDuplicate}"
      :focus="setFocus === 'front'"
      v-model="front"
      placeholder="Hint"
      @startEdit="focus"
      @next="tab"
    />
    <EditableTextField
      class="textfield back"
      :focus="setFocus === 'back'"
      v-model="back"
      placeholder="Answer"
      @startEdit="focus"
      @prev="shiftTab"
    />

    <FloatingText 
      :text="floatText"
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
import EditableTextField from './EditableTextField'

export default {
  props: {},
  data() {
    return {
      front: '',
      back: '',
      metaDown: false,
      floatText: '',
      isDuplicate: false,
      setFocus: 'front',
    }
  },
  components: {
    FloatingText,
    EditableTextField,
  },
  computed: {
    cards() {
      return this.$store.state.setList[this.$store.state.currentSetId].cards
    },
  },
  watch: {
    front(newFront) {
      if (newFront.length < 2) return (this.isDuplicate = false)
      this.isDuplicate = this.cards.find(card => card.front === newFront)
    },
  },
  mounted() {
    window.addEventListener('keydown', this.keyDown)
    window.addEventListener('keyup', this.keyUp)
    this.$store.commit('setAppState', 'addCard')
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
      this.floatText = 'Card added.'
      setTimeout(() => (this.floatText = ''), 1500)
      this.$nextTick(() => {
        this.front = ''
        this.back = ''
        this.isDuplicate = false
        this.setFocus = null
        this.$nextTick(() => (this.setFocus = 'front'))
      })
    },
    keyDown(event) {
      if (event.key === 'Meta') this.metaDown = true
      if (event.key === 'Enter' && this.metaDown) this.$nextTick(this.newCard)
    },
    keyUp(event) {
      if (event.key === 'Meta') this.metaDown = false
    },
    focus() {
      this.$store.commit('setIsEditingText', true)
    },
    tab(e) {
      e.preventDefault()
      this.setFocus = null
      this.$nextTick(() => (this.setFocus = 'back'))
    },
    shiftTab(e) {
      e.preventDefault()
      this.setFocus = null
      this.$nextTick(() => (this.setFocus = 'front'))
    },
  },
}
</script>

<style lang="scss" scoped>
.cardcreator {
  position: relative;
  margin: 0 auto;
  opacity: 1;
  transition: all 0.5s;

  & > * {
    display: block;
  }

  .textfield {
    background: #f8f8f8;
    padding: 50px 20px;
    white-space: pre-wrap;
    font-size: 1.5rem;
    text-align: center;
    transition: background 0.2s;
    outline: 0;

    &.editabletextediting {
      background: rgba(0, 0, 0, 0.05);
    }

    &:after {
      position: absolute;
      top: 10px;
      right: -10px;
      opacity: 0;
      content: '';
      transition: all 0.4s;
      font-weight: 600;
      font-size: 0.5em;
    }

    &:hover:not(.editabletextediting) {
      position: relative;
      background: rgba(0, 0, 0, 0.05);

      &:after {
        right: 10px;
        content: 'Click to Edit';
        opacity: 1;
        color: rgba(black, 0.2);
      }
    }

    &.duplicate {
      &:after {
        right: 10px;
        content: 'Duplicate card!' !important;
        color: rgba(#f52, 1) !important;
        opacity: 1;
      }
    }
  }

  .back {
    border-top: 1px solid #ddd;
    transition: 0.2s;
  }

  button {
    width: 100%;
    margin-top: 20px;
  }
}
</style>
