<template></template>
<script>
import { getKeyWord } from './assets/commonFunctions.js'
export default {
  props: {
    text: {
      default: '',
    },
    language: {
      required: true,
    },
  },
  data() {
    return {
      speaker: null,
    }
  },
  computed: {
    settings() {
      return this.$store.state.setList[this.$store.state.currentSetId].settings
    },
  },
  watch: {
    language(newLang) {
      this.speaker.lang = newLang
    },
    text(newText) {
      if (newText) this.speakWord()
    },
  },
  mounted() {
    if (window.speechSynthesis) {
      this.speaker = new SpeechSynthesisUtterance()
      this.speaker.lang = this.language
      this.speaker.volume = 0.4
      this.speaker.rate = this.settings.speechSpeed || 0.8
    }
  },
  methods: {
    speakWord() {
      if (!this.speaker) return
      this.speaker.text = this.text
      window.speechSynthesis.speak(this.speaker)
    },
  },
}
</script>
