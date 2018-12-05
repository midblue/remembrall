<template>
  <div class="settings">
    <div class="settingslist">
      <Toggle
        key="aadd"
        :setTo="settings.autoAddNew"
        label="Auto-add new cards as older cards are mastered"
        @toggled="
          updateSettings({ autoAddNew: !(settings.autoAddNew ? true : false) })
        "
      />

      <p v-if="!settings.autoAddNew">
        <EditableTextField
          class="visibletextfield marright"
          :text="
            `${settings.maxNewPerDay === 0 ? 0 : settings.maxNewPerDay || 10}`
          "
          :lineBreaksAllowed="false"
          @endEdit="updateMaxNewPerDay"
        />
        <b>New cards per day</b>
      </p>

      <select v-model="selectedLanguageTools" class="marright">
        <option v-for="(language, key) in languages" :key="key" :value="key">{{
          language
        }}</option>
      </select>
      <b>Language Tools</b>

      <Toggle
        v-if="selectedLanguageTools && selectedLanguageTools !== 'none'"
        key="autospeak"
        :setTo="settings.autoSpeak"
        label="Auto-speak card backs"
        @toggled="
          updateSettings({ autoSpeak: !(settings.autoSpeak ? true : false) })
        "
      />

      <Toggle
        key="rev"
        :setTo="settings.studyReverse"
        label="Study cards back-to-front"
        @toggled="
          updateSettings({
            studyReverse: !(settings.studyReverse ? true : false),
          })
        "
      />

      <Toggle
        key="mix"
        :setTo="settings.shuffleCards"
        label="Shuffle cards (new & reviews)"
        @toggled="
          updateSettings({
            shuffleCards: !(settings.shuffleCards ? true : false),
          })
        "
      />

      <!--
        <Toggle
          key="pro"
          :setTo="settings.pronunciationLink"
          label="Pronunciation link"
          @toggled="updateSettings({ pronunciationLink : !(settings.pronunciationLink ? true : false) })"
        />
        <Toggle
          key="tra"
          :setTo="settings.translationLink"
          label="Translation link"
          @toggled="updateSettings({ translationLink : !(settings.translationLink ? true : false) })"
        />
      -->
      <div>Click your set's name (above) to edit it.</div>
      <button @click="downloadSet">Download Set</button>
      <button @click="deleteSet">Delete Set</button>
    </div>
  </div>
</template>

<script>
import EditableTextField from './EditableTextField'
import Toggle from './Toggle'

export default {
  props: {},
  components: {
    EditableTextField,
    Toggle,
  },
  data() {
    return {
      selectedLanguageTools: null,
      languages: {
        none: 'None',
        ar: 'Arabic',
        zh: 'Chinese',
        da: 'Danish',
        en: 'English',
        fr: 'French',
        de: 'German',
        it: 'Italian',
        ja: 'Japanese',
        ko: 'Korean',
        es: 'Spanish',
      },
    }
  },
  computed: {
    currentSet() {
      return this.$store.state.setList[this.$store.state.currentSetId]
    },
    settings() {
      return (
        this.$store.state.setList[this.$store.state.currentSetId].settings || {}
      )
    },
  },
  mounted() {
    this.selectedLanguageTools = this.settings.languageTools || 'none'
  },
  beforeDestroy() {},
  watch: {
    selectedLanguageTools(newSelection) {
      let newTools = newSelection === 'none' ? null : newSelection
      this.updateSettings({ languageTools: newTools })
    },
  },
  methods: {
    deleteSet() {
      if (
        confirm(
          `Do you really want to delete the set "${this.currentSet.name}"?`
        )
      ) {
        this.$store.commit('deleteSet', this.currentSet.id)
        this.$store.commit('setAppState', 'study')
      }
    },
    updateSettings(settings) {
      this.$store.commit('updateSetSettings', {
        ...settings,
      })
    },
    updateMaxNewPerDay(newValue) {
      const parsedValue =
        parseInt(newValue) === 0 ? 0 : parseInt(newValue) || 10
      this.$store.commit('updateSetSettings', { maxNewPerDay: parsedValue })
    },
    downloadSet() {
      downloadObjectAsJson(
        this.currentSet,
        this.currentSet.name +
          ' ' +
          new Date().toLocaleDateString() +
          ' ' +
          new Date().toLocaleTimeString()
      )
    },
  },
}

function downloadObjectAsJson(exportObj, exportName) {
  var dataStr =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(exportObj))
  var downloadAnchorNode = document.createElement('a')
  downloadAnchorNode.setAttribute('href', dataStr)
  downloadAnchorNode.setAttribute('download', exportName + '.json')
  document.body.appendChild(downloadAnchorNode) // required for firefox
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}
</script>

<style lang="scss" scoped>
.settingslist {
  max-width: 300px;
  margin: 0 auto;
  margin-top: 20px;

  & > * {
    margin-bottom: 40px;
  }
}

p {
  margin-bottom: 10px;

  & > * {
    display: inline-block;
    min-width: 55px;
  }
  // display: grid;
  // grid-gap: 10px;
  // grid-template-columns: 60px 1fr;
}

button {
  width: 100%;
}

.marright {
  margin-right: 10px;
}
</style>
