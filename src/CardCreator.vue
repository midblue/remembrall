<template>
  <div class="cardcreator">
    <div class="cardframe">
      <EditableTextFieldMarkdown
        class="textfield front"
        :class="{ duplicate: isDuplicate }"
        :focus="setFocus === 'front'"
        v-model="front"
        placeholder="Hint"
        @startEdit="focus"
        @next="tab"
        @setImageURL="setImageURL"
      />
      <div class="imagecontainer" v-if="imageURL" @click="imageURL = ''">
        <ImageLoader :url="imageURL" />
      </div>
      <EditableTextFieldMarkdown
        class="textfield back"
        :focus="setFocus === 'back'"
        v-model="back"
        placeholder="Answer"
        @startEdit="focus"
        @prev="shiftTab"
        @setImageURL="setImageURL"
      />
    </div>

    <FloatingText :text="floatText" offset="-30" />
    <div class="buttonlist">
      <button @click="newCard">
        <div>Add Card</div>
        <kbd class="keyicon">⌘-Enter</kbd>
      </button>
    </div>

    <center>
      <span class="sub" style="position: relative; top: -5px;"
        >Paste an image link to add your own image. Or,</span
      >
      <br />
      <button @click="autoSetImage">
        <div>Auto-Set Image</div>
        <kbd class="keyicon">⌘-i</kbd>
      </button>
      <br />
      <div v-if="imageURL" class="sub" style="position: relative; top: 5px;">
        (click image to remove it)
      </div>
    </center>
    <br /><br />
  </div>
</template>

<script>
import FloatingText from './FloatingText'
import EditableTextFieldMarkdown from './EditableTextFieldMarkdown'
import ImageLoader from './ImageLoader'
import { getRandomImage } from './assets/commonFunctions'

export default {
  props: {},
  data() {
    return {
      front: '',
      back: '',
      imageURL: '',
      metaDown: false,
      floatText: '',
      isDuplicate: false,
      setFocus: 'front',
    }
  },
  components: {
    FloatingText,
    EditableTextFieldMarkdown,
    ImageLoader,
  },
  computed: {
    cards() {
      return this.$store.state.setList[this.$store.state.currentSetId].cards
    },
  },
  watch: {
    front(newFront) {
      if (newFront.length < 2) return (this.isDuplicate = false)
      this.isDuplicate = this.cards.find(
        card => card.front.toLowerCase() === newFront.toLowerCase()
      )
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
      if ((!this.front && !this.imageURL) || !this.back) return
      this.$store.commit('addCard', {
        id: Date.now(),
        front: this.front,
        back: this.back,
        imageURL: this.imageURL,
        nextReview: 0,
        set: parseInt(this.$store.state.currentSetId),
      })
      this.floatText = 'Card added.'
      setTimeout(() => (this.floatText = ''), 1500)
      this.$nextTick(() => {
        this.front = ''
        this.back = ''
        this.imageURL = ''
        this.isDuplicate = false
        this.setFocus = null
        this.$nextTick(() => (this.setFocus = 'front'))
      })
    },
    keyDown(event) {
      if (event.key === 'Meta') this.metaDown = true
      if (event.key === 'Enter' && this.metaDown) this.$nextTick(this.newCard)
      if (event.key === 'i' && this.metaDown) {
        event.preventDefault()
        event.stopPropagation()
        this.autoSetImage()
      }
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
    setImageURL(url) {
      this.imageURL = url
    },
    autoSetImage() {
      getRandomImage(this.front || this.back).then(image => {
        if (image) this.imageURL = image
      })
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

  .cardframe {
    position: relative;
    overflow: hidden;
    border-radius: 10px;
  }

  .imagecontainer {
    background: #f8f8f8;
    text-align: center;

    & > * {
      margin: 0 auto;
      max-width: 80%;
      max-height: 250px;
    }
  }

  .textfield {
    background: #f8f8f8;
    padding: 50px 20px;
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

  .buttonlist {
    display: flex;
    width: 100%;
    margin-top: 20px;
    margin-bottom: 20px;
  }
}
</style>
