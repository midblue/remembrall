<template>
  <div
    class="settings"
  >
		<div class="settingslist">
      <p>
        <b>New Cards/Day:</b>
        <span>
          <EditableTextField
            :text="`${ settings.maxNewPerDay || 10 }`"
            :lineBreaksAllowed="false"
            @endEdit="updateMaxNewPerDay"
          />
        </span>
      </p>
      <p>
        <b>Pronunciation Link:</b>
        <span
          @click="updateSettings({ pronunciationLink : !(settings.pronunciationLink ? true : false) })"
        >
          <input type="checkbox" :checked="settings.pronunciationLink" />
          <span>
            {{ settings.pronunciationLink ? 'on' : 'off' }}
          </span>
        </span>
      </p>
      <p>
        <b>Translation Link:</b>
        <span
          @click="updateSettings({ translationLink : !(settings.translationLink ? true : false) })"
        >
          <input type="checkbox" :checked="settings.translationLink" />
          <span>
            {{ settings.translationLink ? 'on' : 'off' }}
          </span>
        </span>
      </p>
      <p>
        <b>Study Back/Front:</b>
        <span
          @click="updateSettings({ studyReverse : !(settings.studyReverse ? true : false) })"
        >
          <input type="checkbox" :checked="settings.studyyReverse" />
          <span>
            {{ settings.studyyReverse ? 'on' : 'off' }}
          </span>
        </span>
      </p>
      <p>
        <b>Day Reset:</b>
        <span>xx</span>
      </p>
			<p>
        <b>Set Name:</b>
        <span>Click your set's name (above) to edit it.</span>
      </p>
      <button @click="deleteSet">Delete Set</button>

		</div>
  </div>
</template>

<script>
import EditableTextField from './EditableTextField'

export default {
	props: {
	},
  components: {
    EditableTextField,
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
  p {
    margin-bottom: 35px;
    display: grid;
    grid-gap: 15px;
    grid-template-columns: 160px 1fr;

    & > *:first-child {
      text-align: right;
      width: 100%;
    }
  }

  button {
    width: 100%;
  }
</style>

