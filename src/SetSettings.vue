<template>
  <div
    class="settings"
  >
		<div class="settingslist">
      <p>
        <EditableTextField
          class="visibletextfield"
          :text="`${ settings.maxNewPerDay || 10 }`"
          :lineBreaksAllowed="false"
          @endEdit="updateMaxNewPerDay"
        />
        <b>New cards per day</b>
      </p>
      <Toggle
        :setTo="settings.pronunciationLink"
        label="Pronunciation link"
        @toggled="updateSettings({ pronunciationLink : !(settings.pronunciationLink ? true : false) })"
      />
      <Toggle
        :setTo="settings.translationLink"
        label="Translation link"
        @toggled="updateSettings({ translationLink : !(settings.translationLink ? true : false) })"
      />
      <Toggle
        :setTo="settings.studyReverse"
        label="Study card backs first"
        @toggled="updateSettings({ studyReverse : !(settings.studyReverse ? true : false) })"
      />
      <p>
        <EditableTextField
          class="visibletextfield"
          :text="'??'"
          :lineBreaksAllowed="false"
        />
        <b>Day reset hour</b>
      </p>
      <div>Click your set's name (above) to edit it.</div>
      <br />
      <button @click="deleteSet">Delete Set</button>

		</div>
  </div>
</template>

<script>
import EditableTextField from './EditableTextField'
import Toggle from './Toggle'

export default {
	props: {
	},
  components: {
    EditableTextField, Toggle,
  },
  data () {
    return {
      
    }
  },
  computed: {
		currentSet () { return this.$store.state.setList[this.$store.state.currentSetId] },
    settings () { return this.$store.state.setList[this.$store.state.currentSetId].settings || {} },
  }, 
  mounted () {
		
	},
	beforeDestroy () {
		
	},
	watch : {
		
	},
  methods: {
    deleteSet () {
      if (confirm(`Do you really want to delete the set "${ this.currentSet.name }"?`)) {
        this.$store.commit('deleteSet', this.currentSet.id)
				this.$store.commit('setAppState', 'study')
			}
    },
    updateSettings (settings) {
      this.$store.commit('updateSetSettings', {
        ...settings
      })
    },
    updateMaxNewPerDay (newValue) {
      const parsedValue = parseInt(newValue) || 10
      this.updateSettings({ maxNewPerDay: parsedValue })
    }
  }
}

</script>

<style lang="scss" scoped>

  .settingslist {
    max-width: 300px;
    margin: 0 auto;

    & > * {
      margin-bottom: 40px;
    }
  }

  p {
    margin-bottom: 10px;
    display: grid;
    grid-gap: 10px;
    grid-template-columns: 60px 1fr;
  }

  .visibletextfield {
    border: 1px solid #bbb;
    text-align: center;
    padding: 2px 0;
    position: relative;
    top: -3px;
  }

  button {
    width: 100%;
  }
</style>

