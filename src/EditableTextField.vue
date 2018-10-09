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
    startEdit () {
      if (this.isEditing) return
      this.isEditing = true
      this.metaDown = false
      this.$nextTick(this.selectText)
      this.$emit('startEdit')
    },
    commitEdit () {
      this.isEditing = false
      this.metaDown = false
      const finalText = this.$el.innerHTML
        .replace(/^[\s\n\t]*/g, '')
        .replace(/[\s\n\t]*$/g, '')
      this.$emit('endEdit', finalText)
    },
    keyDown (event) {
      if (!this.isEditing) return
      if (event.key === 'Meta') this.metaDown = true
      if (event.key === 'Enter' && !this.lineBreaksAllowed)
        this.commitEdit()
			if (event.key === 'Enter' && this.metaDown)
        this.commitEdit()
    },
    keyUp (event) {
      if (!this.isEditing) return
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

