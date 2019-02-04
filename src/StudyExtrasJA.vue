<template>
  <div v-if="kanjiList">
    <div
      class="kanji sub"
      v-for="kanji in kanjiList"
      :key="kanji.character"
      @mouseover="examplesToShow = kanji.examples"
      @mouseout="examplesToShow = null"
    >
      {{ kanji.character }} : {{ kanji.message || kanji.meaning }}
    </div>
    <div
      v-if="examplesToShow && examplesToShow.length > 0"
      class="examplespopup"
    >
      <div v-for="(example, index) in examplesToShow" :key="index" class="sub">
        {{ example.japanese }}: {{ example.meaning }}
      </div>
    </div>
  </div>
</template>
<script>
const keys = require('./assets/keys')
export default {
  props: {
    text: {
      default: '',
    },
  },
  data() {
    return {
      kanjiList: [],
      examplesToShow: null,
    }
  },
  computed: {
    settings() {
      return this.$store.state.setList[this.$store.state.currentSetId].settings
    },
    searchString() {
      return this.text.replace(/\n.*/g, '')
    },
  },
  watch: {
    text() {
      this.getKanjiData()
    },
  },
  mounted() {
    this.getKanjiData()
  },
  methods: {
    getKanjiData() {
      const kanjiInText = this.text.replace(/[^\u4e00-\u9faf]/g, '')
      this.kanjiList = Array.from(kanjiInText).map(character => ({
        character: character,
        message: 'loading...',
      }))
      Array.from(kanjiInText).forEach((character, index) => {
        fetch(
          `https://kanjialive-api.p.rapidapi.com/api/public/kanji/${character}`,
          {
            headers: {
              'X-RapidAPI-Key': keys.rapidAPI,
            },
          }
        )
          .then(res => res.json())
          .then(kanjiInfo => {
            if (kanjiInfo.error || kanjiInfo.message)
              return this.$set(this.kanjiList, index, {
                character: character,
                message: kanjiInfo.error || kanjiInfo.message,
              })
            this.$set(this.kanjiList, index, {
              character: kanjiInfo.kanji.character,
              meaning: kanjiInfo.kanji.meaning.english,
              examples: kanjiInfo.examples.slice(0, 4).map(example => ({
                japanese: example.japanese,
                meaning: example.meaning.english,
              })),
            })
          })
      })
    },
  },
}
</script>
<style scoped lang="scss">
.examplespopup {
  position: absolute;
  background: rgba(#f8f8f8, 1);
  padding: 40px;
  top: 0;
  left: 0;
  width: 100%;
}
</style>
