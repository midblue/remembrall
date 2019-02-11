<template>
  <div v-if="kanjiList">
    <div
      class="kanji sub"
      v-for="kanji in kanjiList"
      v-if="kanji.meaning"
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
const keys = require('../keys')
// const jishoApi = require('unofficial-jisho-api')
// const jisho = new jishoApi()
export default {
  props: {
    text: {
      default: '',
    },
    secondaryText: {
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
      const kanjiInText = Array.from(
        new Set(
          `${this.text.replace(
            /[^\u4e00-\u9faf]/g,
            ''
          )}${this.secondaryText.replace(/[^\u4e00-\u9faf]/g, '')}`
        )
      )
      this.kanjiList = kanjiInText.map(character => ({
        character: character,
        meaning: 'loading...',
      }))
      Array.from(kanjiInText).forEach((character, index) => {
        // const SEARCH_KANJI = '車'
        // const SEARCH_URI = jisho.getUriForKanjiSearch(SEARCH_KANJI)

        // fetch(SEARCH_URI)
        //   .then(res => res.json)
        //   .then(body => {
        //     const json = jisho.parseKanjiPageHtml(body, SEARCH_KANJI)
        //     console.log(`JLPT level: ${json.jlptLevel}`)
        //     console.log(`Stroke count: ${json.strokeCount}`)
        //     console.log(`Meaning: ${json.meaning}`)
        //   })

        // jisho.searchForKanji('語').then(result => {
        //   console.log('Found: ' + result.found)
        //   console.log('Taught in: ' + result.taughtIn)
        //   console.log('JLPT level: ' + result.jlptLevel)
        //   console.log(
        //     'Newspaper frequency rank: ' + result.newspaperFrequencyRank
        //   )
        //   console.log('Stroke count: ' + result.strokeCount)
        //   console.log('Meaning: ' + result.meaning)
        //   console.log('Kunyomi: ' + JSON.stringify(result.kunyomi))
        //   console.log(
        //     'Kunyomi example: ' + JSON.stringify(result.kunyomiExamples[0])
        //   )
        //   console.log('Onyomi: ' + JSON.stringify(result.onyomi))
        //   console.log(
        //     'Onyomi example: ' + JSON.stringify(result.onyomiExamples[0])
        //   )
        //   console.log('Radical: ' + JSON.stringify(result.radical))
        //   console.log('Parts: ' + JSON.stringify(result.parts))
        //   console.log('Stroke order diagram: ' + result.strokeOrderDiagramUri)
        //   console.log('Stroke order SVG: ' + result.strokeOrderSvgUri)
        //   console.log('Stroke order GIF: ' + result.strokeOrderGifUri)
        //   console.log('Jisho Uri: ' + result.uri)
        // })

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
              examples: kanjiInfo.examples.slice(0, 3).map(example => ({
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
  padding: 20px;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
}
</style>
