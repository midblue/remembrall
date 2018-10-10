<template>
  <div
    class="editabletext"
    :class="{ editabletextediting: isEditing, }"
    :contenteditable="isEditing"
    @focus="startEdit"
    @click="startEdit"
    @blur="commitEdit"
    v-html="displayText"
  ></div>
</template>

<script>

export default {
  props: {
    text: {
      required: false,
      default: '',
      type: String,
    },
    lineBreaksAllowed: {
      required: false,
      default: true,
      type: Boolean,
    },
    acceptBlank: {
      required: false,
      default: false,
      type: Boolean,
    },
    disableEdits: {
      required: false,
      default: false,
      type: Boolean,
    }
  },
  components: {
  },
  data () {
    return {
      displayText: this.text,
      isEditing: false,
      metaDown: false,
    }
  },
  computed: {
    
  },
  watch: {
    text (newText) {
      if (newText !== this.displayText && !this.isEditing)
        this.displayText = newText
    },
    disableEdits (isDisabled) {
      this.isEditing = false
      this.metaDown = false
    },
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
    startEdit () {
      if (this.isEditing || this.disableEdits) return
      this.isEditing = true
      this.metaDown = false
      this.$nextTick(this.selectText)
      this.$emit('startEdit')
    },
    commitEdit () {
      const finalText = this.$el.innerHTML
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/^[\s\n\t]*/g, '')
        .replace(/[\s\n\t]*$/g, '')
      if (finalText.length > 0)
        this.$emit('endEdit', finalText)
      else {
        this.displayText = ''
        this.$nextTick(() => this.displayText = this.text)
      }
      this.isEditing = false
      this.metaDown = false
    },
    keyDown (event) {
      if (!this.isEditing || this.disableEdits) return
      if (event.key === 'Meta') this.metaDown = true
      if (event.key === 'Enter' && !this.lineBreaksAllowed)
        this.commitEdit()
			if (event.key === 'Enter' && this.metaDown)
        this.commitEdit()
    },
    keyUp (event) {
      if (!this.isEditing || this.disableEdits) return
      if (event.key === 'Meta') this.metaDown = false
    },
    selectText () {
      if (document.body.createTextRange) {
        const range = document.body.createTextRange()
        range.moveToElementText(this.$el)
        range.select()
      }
      else if (window.getSelection) {
        const selection = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(this.$el)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    },
  }
}
</script>

<style lang="scss">
  .editabletext {
    cursor: pointer;

    &.editabletextediting {
      cursor: text;
    }
  }
</style>

