<template>
  <div class="extras" v-if="text">
    <StudyExtrasJA :text="text" v-if="settings.languageTools === 'ja'" />
    <template v-if="speaker">
      <a @click="speakWord" class="fakelink sub">Speak it</a><span> ・ </span>
    </template>
    <a target="_blank" :href="pronunciationLink" class="sub">Native</a
    ><span> ・ </span>
    <a target="_blank" :href="translationLink" class="sub">Translation</a>
  </div>
</template>
<script>
import StudyExtrasJA from './StudyExtrasJA'
import { getKeyWord } from './assets/commonFunctions.js'
export default {
  props: {
    text: {
      default: '',
    },
    autoSpeak: {
      default: false,
    },
    shown: {
      default: false,
    },
  },
  components: { StudyExtrasJA },
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
      return this.text.replace(/\n.*/g, '')
    },
    searchWord() {
      return getKeyWord(this.searchString)
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
    shown(willShow) {
      if (willShow && this.settings.autoSpeak) this.speakWord()
    },
  },
  mounted() {
    if (window.speechSynthesis) {
      this.speaker = new SpeechSynthesisUtterance()
      this.speaker.lang = this.settings.languageTools
      this.speaker.volume = 0.4
    }
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
