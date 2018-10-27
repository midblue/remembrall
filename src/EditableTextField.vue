<template>
  <div
    class="editabletext"
    :class="{
      editabletextediting: isEditing, 
      placeholder: isPlaceholder,
    }"
    :contenteditable="isEditing"
    @focus="startEdit"
    @click="startEdit"
    @input="$emit('changeText', sanitize($el.innerHTML))"
    @blur="commitEdit"
    tabindex="0"
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
      isPlaceholder: this.text.length === 0,
    }
  },
  model: {
    prop: 'text',
    event: 'changeText',
  },
  computed: {},
  watch: {
    text(newText) {
      if (newText !== this.displayText && !this.isEditing)
        this.displayText = newText
    },
    disableEdits(isDisabled) {
      this.isEditing = false
      this.metaDown = false
      this.shiftDown = false
    },
    focus(shouldFocus) {
      if (shouldFocus) this.startEdit()
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
    commitEdit() {
      const finalText = this.sanitize(this.$el.innerHTML)
      if (finalText.length > 0) this.$emit('endEdit', finalText)
      else {
        this.displayText = ''
        this.$nextTick(() => (this.displayText = this.placeholder))
        this.isPlaceholder = true
      }
      this.isEditing = false
      this.metaDown = false
      this.shiftDown = false
    },
    keyDown(event) {
      if (!this.isEditing || this.disableEdits) return
      if (event.key === 'Meta') this.metaDown = true
      if (event.key === 'Shift') this.shiftDown = true
      if (event.key === 'Enter' && !this.lineBreaksAllowed) this.commitEdit()
      if (event.key === 'Enter' && this.metaDown) this.commitEdit()
      if (event.key === 'Tab' && this.shiftDown) this.$emit('prev', event)
      if (event.key === 'Tab') this.$emit('next', event)
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
      return text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/^[\s\n\t]*/g, '')
        .replace(/[\s\n\t]*$/g, '')
    },
  },
}
</script>

<style lang="scss">
.editabletext {
  cursor: pointer;

  &.placeholder {
    color: rgba(black, 0.2);
  }

  &.editabletextediting {
    cursor: text;
  }
}
</style>
