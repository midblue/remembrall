<template>
  <div class="sub extras" v-if="text">
    <a v-if="speaker" @click="speakWord" class="fakelink">Speak it</a>
    <span v-if="speaker"> ・ </span>
    <a target="_blank" :href="pronunciationLink">Native</a> <span> ・ </span>
    <a target="_blank" :href="translationLink">Translation</a>
  </div>
</template>
<script>
export default {
  props: {
    text: {
      default: '',
    },
    autoSpeak: {
      default: false,
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
    searchString() {
      let searchString = this.text
      let linebreakPos = this.text.indexOf('\n')
      if (linebreakPos !== -1)
        searchString = this.text.substring(0, linebreakPos)
      return searchString
    },
    searchWord() {
      return this.searchString
        .toLowerCase()
        .split(/[ /;.,?¿!+]/)
        .reduce(
          (longestString, currString) =>
            currString.length > longestString.length
              ? currString
              : longestString,
          ''
        )
    },
    pronunciationLink() {
      return `https://forvo.com/word/${this.searchWord}/#${
        this.settings.languageTools
      }`
    },
    translationLink() {
      return `https://translate.google.com/#${this.settings.languageTools}/en/${
        this.searchString
      }`
    },
  },
  watch: {
    settings(newSettings) {
      this.speaker.lang = newSettings.languageTools
    },
  },
  mounted() {
    if (window.speechSynthesis) {
      this.speaker = new SpeechSynthesisUtterance()
      this.speaker.lang = this.settings.languageTools
      this.speaker.volume = 0.4
    }
    if (this.settings.autoSpeak) this.speakWord()
  },
  methods: {
    speakWord() {
      if (!this.speaker) return
      this.speaker.text = this.searchString
      window.speechSynthesis.speak(this.speaker)
    },
  },
}
</script>
<style scoped lang="scss">
.extras {
  padding-bottom: 20px;
}
.fakelink {
  text-decoration: underline;
  cursor: pointer;
}
</style>
