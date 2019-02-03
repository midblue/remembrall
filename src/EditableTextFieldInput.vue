<template>
  <input
    type="text"
    class="editabletext"
    :class="{
      editabletextediting: isEditing,
    }"
    :placeholder="placeholder"
    @focus="startEdit"
    @click="startEdit"
    @blur="commitEdit"
    @paste="paste"
    tabindex="0"
    v-model="displayText"
  />
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
    },
    placeholder: {
      required: false,
      default: '',
      type: String,
    },
    focus: {
      required: false,
      default: false,
      type: Boolean,
    },
  },
  components: {},
  data() {
    return {
      displayText: this.text,
      isEditing: false,
      metaDown: false,
      shiftDown: false,
    }
  },
  model: {
    prop: 'text',
    event: 'changeText',
  },
  computed: {},
  watch: {
    text(newText) {
      if (!this.isEditing) {
        this.resetTextTo(newText)
      }
    },
		displayText(newText) {
			this.$emit('changeText', sanitize($el.innerHTML))
		}

    disableEdits(isDisabled) {
      this.isEditing = false
      this.metaDown = false
      this.shiftDown = false
    },
    focus(shouldFocus) {
      if (shouldFocus)
        this.$nextTick(() => {
          this.startEdit()
        })
    },
  },
  mounted() {
    window.addEventListener('keydown', this.keyDown)
    window.addEventListener('keyup', this.keyUp)
    if (this.isPlaceholder) this.displayText = this.placeholder
    if (this.focus) this.startEdit()
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.keyDown)
    window.removeEventListener('keyup', this.keyUp)
  },
  methods: {
    startEdit() {
      if (this.isEditing || this.disableEdits) return
      this.isEditing = true
      // console.log('start edit')
      if (this.isPlaceholder) this.displayText = ''
      this.isPlaceholder = false
      this.metaDown = false
      this.shiftDown = false
      this.$nextTick(() => {
        this.$el.focus()
        this.$nextTick(this.selectText)
      })
      this.$emit('startEdit', this.displayText)
    },
    resetTextTo(newText) {
      this.displayText = ''
      this.$el.innerHTML = ''
      this.$nextTick(() => {
        this.displayText = newText
        if (!newText && this.placeholder && !this.isEditing) {
          this.displayText = this.placeholder
          this.isPlaceholder = true
        }
      })
    },
    commitEdit() {
      if (window.getSelection) window.getSelection().removeAllRanges()
      else if (document.selection) document.selection.empty()
      this.isEditing = false
      // console.log('commit edit')
      this.metaDown = false
      this.shiftDown = false
      const finalText = this.sanitize(this.$el.innerHTML)
      if (finalText.length > 0) this.$emit('endEdit', finalText)
      else this.resetTextTo(this.text)
    },
    keyDown(event) {
      if (!this.isEditing || this.disableEdits) return
      if (event.key === 'Meta') this.metaDown = true
      if (event.key === 'Shift') this.shiftDown = true
      if (event.key === 'Enter' && !this.lineBreaksAllowed) this.commitEdit()
      if (event.key === 'Enter' && this.metaDown) this.commitEdit()
      if (event.key === 'Tab' && this.shiftDown) this.$emit('prev', event)
      if (event.key === 'Tab') this.$emit('next', event)
      if (event.key === 'Escape') {
        this.resetTextTo(this.text)
        this.$nextTick(this.commitEdit)
      }
    },
    keyUp(event) {
      if (!this.isEditing || this.disableEdits) return
      if (event.key === 'Meta') this.metaDown = false
      if (event.key === 'Shift') this.shiftDown = false
    },
    selectText() {
      if (document.body.createTextRange) {
        const range = document.body.createTextRange()
        range.moveToElementText(this.$el)
        range.select()
      } else if (window.getSelection) {
        const selection = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(this.$el)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    },
    sanitize(text) {
      const sanitizedText = text
        .replace(/<\/div>/g, '\n')
        .replace(/<br\s?\/?>/g, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/^[\s\n\t]*/g, '')
        .replace(/[\s\n\t]*$/g, '')
      return sanitizedText
    },
    paste(e) {
      e.stopPropagation()
      e.preventDefault()
      const clipboardData = e.clipboardData || window.clipboardData
      const pastedData = this.sanitize(clipboardData.getData('Text'))
      if (/.(jpe?g|png|gif|webm|bmp)$/gi.test(pastedData)) {
        return this.$emit('setImageURL', pastedData)
      }
      if (/^data:/gi.test(pastedData)) {
        return alert(
          `that's image data, not a link! make sure you get an image url that ends in .jpg, .png, .gif, etc.`
        )
      }
      const existingText = this.sanitize(this.$el.innerHTML)

      let caretPosition = 0,
        selection,
        range
      if (window.getSelection) {
        selection = window.getSelection()
        if (selection.rangeCount) {
          range = selection.getRangeAt(0)
          if (range.commonAncestorContainer.parentNode == this.$el) {
            caretPosition = range.endOffset
          }
        }
      } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange()
        if (range.parentElement() == this.$el) {
          var tempEl = document.createElement('span')
          this.$el.insertBefore(tempEl, this.$el.firstChild)
          var tempRange = range.duplicate()
          tempRange.moveToElementText(tempEl)
          tempRange.setEndPoint('EndToEnd', range)
          caretPosition = tempRange.text.length
        }
      } // this only works if there's only one line (i.e. one div)
      console.log(caretPosition)

      const newText =
        existingText.substring(0, caretPosition) +
        pastedData +
        existingText.substring(caretPosition)
      this.displayText = newText
      this.$emit('changeText', this.displayText)
    },
  },
}
</script>

<style lang="scss">
.editabletext {
  cursor: pointer;
  white-space: pre-wrap;

  &.placeholder {
    color: rgba(black, 0.2);
  }

  &.editabletextediting {
    cursor: text;
  }
}
</style>
