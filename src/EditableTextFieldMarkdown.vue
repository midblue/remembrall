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
    @paste="paste"
    tabindex="0"
    v-html="isEditing ? displayText : displayMarkdown"
  ></div>
</template>

<script>
const markdownit = require('markdown-it')({
  breaks: true,
  html: true,
  typographer: true,
})

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
  computed: {
    displayMarkdown() {
      let markdown = (this.displayText.length > 0
        ? this.displayText
        : this.text
      )
        .split('\n')
        .map(string => {
          const output = markdownit.render(string)
          return output || '<br />'
        })
        .join('')
        .replace(/(<br \/>)*$/, '')
      // .replace(/<br ?\/?>\n?/gim, '')
      // .replace(/<\/?p>/gm, '')
      // console.log(markdown, this.displayText)
      // markdown = markdown
      //   .replace(/\n/, '<br />')
      //   .replace(/><br \/></, '><')
      return markdown
    },
  },
  watch: {
    text(newText) {
      this.isPlaceholder = newText.length === 0
      if (!this.isEditing) {
        this.resetTextTo(newText)
      }
    },
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
      if (finalText.length > 0) {
        this.displayText = finalText
        this.$emit('endEdit', finalText)
      } else this.resetTextTo(this.text)
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
        .replace(/<div>/g, '\n')
        .replace(/\n<br ?\/?>/g, '\n')
        .replace(/<br ?\/?>/g, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/^[\s\n\t]*/g, '')
      // .replace(/[\s\n\t]*$/g, '')
      return sanitizedText
    },
    paste(e) {
      e.stopPropagation()
      e.preventDefault()

      // get clipboard data
      const clipboardData = e.clipboardData || window.clipboardData
      const pastedData = this.sanitize(clipboardData.getData('Text'))

      // check for image
      if (/.(jpe?g|png|gif|webm|bmp)$/gi.test(pastedData))
        return this.$emit('setImageURL', pastedData)
      if (/^data:/gi.test(pastedData))
        return alert(
          `that's image data, not a link! make sure you get an image url that ends in .jpg, .png, .gif, etc.`
        )

      const existingText = document.activeElement.innerText
      const selected = getSelectedText(this.$el)

      const newText =
        existingText.substring(0, selected.start) +
        pastedData +
        existingText.substring(selected.end)
      this.displayText = newText
      this.$emit('changeText', newText)
      this.$nextTick(this.moveCursorToEnd)
    },
    moveCursorToEnd() {
      let range, selection
      if (document.createRange) {
        range = document.createRange()
        range.selectNodeContents(this.$el)
        range.collapse(false)
        selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)
      } else if (document.selection) {
        range = document.body.createTextRange()
        range.moveToElementText(this.$el)
        range.collapse(false)
        range.select()
      }
    },
  },
}

function getSelectedText(el) {
  const getTextSelection = () => {
    const selection = window.getSelection()
    if (selection != null && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      return {
        start: getTextLength(el, range.startContainer, range.startOffset),
        end: getTextLength(el, range.endContainer, range.endOffset),
      }
    } else return null
  }

  const getTextLength = function(parent, node, offset) {
    let textLength = 0
    // console.log('1', node, node.nodeName)
    if (node.nodeName === '#text') textLength += offset
    else
      for (let i = 0; i < offset; i++)
        textLength += getNodeTextLength(node.childNodes[i])
    if (node !== parent)
      textLength += getTextLength(parent, node.parentNode, getNodeOffset(node))
    return textLength
  }

  const getNodeTextLength = function(node) {
    let textLength = 0
    // console.log('2', node, node.nodeName)
    if (node.nodeName === 'BR') textLength = 1
    else if (node.nodeName === '#text') textLength = node.nodeValue.length
    else if (node.childNodes !== null)
      for (let i = 0; i < node.childNodes.length; i++)
        textLength += getNodeTextLength(node.childNodes[i])
    return textLength
  }

  const getNodeOffset = function(node) {
    return node == null ? -1 : 1 + getNodeOffset(node.previousSibling)
  }

  return getTextSelection(document.activeElement)
}
</script>

<style lang="scss">
.editabletext.editabletextediting:empty {
  &:before {
    content: '\feff'; /* ZERO WIDTH NO-BREAK SPACE */
  }
}

.editabletext {
  cursor: pointer;
  white-space: normal;

  &.placeholder {
    color: rgba(black, 0.2);
  }

  &.editabletextediting {
    cursor: text;
    white-space: pre-wrap;
  }

  p,
  div,
  h1,
  h2,
  h3,
  h4,
  ul,
  ol {
    padding: 0;
    margin: 0;
  }
  ul,
  ol {
    padding: 0 10% 0 10%;
    text-align: left;
  }
}
</style>
