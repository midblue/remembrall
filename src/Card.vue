<template>
  <div>
    <div class="card roundframe" :class="{ new: !totalReviews, mini }">
      <CardTools
        :id="id"
        :totalReviews="totalReviews"
        :ok="ok"
        :front="front"
        :back="back"
        :nextReview="nextReview"
        :set="set"
      />
      <div class="front">
        <EditableTextField
          class="textfield"
          :class="{
            newcard: isNewCard,
          }"
          :text="reverse ? back : front"
          @startEdit="startEdit"
          @endEdit="saveEditedCard(reverse ? 'back' : 'front', ...arguments)"
        />
        <StudyExtras
          v-if="reverse && settings.languageTools && forStudy"
          :text="back"
        />
      </div>
      <div
        class="back"
        :class="{ pointer: showBack === false && forStudy }"
        @click="showBack = true"
      >
        <div :class="{ hideanswer: !showBack && forStudy }">
          <EditableTextField
            class="textfield"
            :text="reverse ? front : back"
            @startEdit="startEdit"
            @endEdit="saveEditedCard(reverse ? 'front' : 'back', ...arguments)"
          />
          <StudyExtras
            v-if="showBack && !reverse && settings.languageTools && forStudy"
            :text="back"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EditableTextField from './EditableTextField'
import CardTools from './CardTools'
import StudyExtras from './StudyExtras'

export default {
  props: {
    reverse: {
      default: false,
    },
    front: {},
    back: {},
    id: {
      required: true,
    },
    set: {
      required: true,
    },
    timeMod: {
      default: 0,
    },
    nextReview: {
      default: 0,
    },
    totalReviews: {
      default: 0,
    },
    created: {
      default: () => new Date().getTime(),
    },
    ok: {
      default: 0,
    },
    again: {
      default: 0,
    },
    forStudy: {
      default: true,
    },
    showBack: {
      default: false,
    },
    mini: {
      default: false,
    },
  },
  components: {
    EditableTextField,
    CardTools,
    StudyExtras,
  },
  computed: {
    settings() {
      return this.$store.state.setList[this.$store.state.currentSetId].settings
    },
    isEditingText() {
      return this.$store.state.isEditingText
    },
    isNewCard() {
      return !this.totalReviews || this.totalReviews === 0
    },
  },
  watch: {},
  mounted() {
    window.addEventListener('keydown', this.keyDown)
    window.addEventListener('keyup', this.keyUp)
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.keyDown)
    window.removeEventListener('keyup', this.keyUp)
  },
  methods: {
    startEdit() {
      if (this.$store.state.appState === 'study')
        this.$store.commit('setAppState', 'editCard')
      this.$store.commit('setIsEditingText', true)
    },
    saveEditedCard(side, newValue) {
      if (this.$store.state.appState === 'editCard')
        this.$store.commit('setAppState', 'study')
      this.$store.commit('setIsEditingText', false)
      if (this[side] === newValue) return
      this.$store.commit('updateCard', {
        id: this.id,
        [side]: newValue,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.card {
  text-align: center;
  position: relative;
  overflow: initial;
}

.front,
.back {
  transition: 0.2s;
  overflow: hidden;
  background: #f8f8f8;
}

.front {
  border-top-right-radius: 10px;
  border-top-left-radius: 10px;
}
.back {
  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;
}

.textfield {
  padding: 45px 30px;
  white-space: pre-wrap;
  font-size: 1.5rem;

  &.editabletextediting {
    background: rgba(0, 0, 0, 0.05);
  }

  &:hover:not(.editabletextediting) {
    position: relative;
    background: rgba(0, 0, 0, 0.05);

    &:after {
      position: absolute;
      top: 10px;
      right: 10px;
      content: 'CLICK TO EDIT';
      font-weight: 600;
      font-size: 0.7rem;
      opacity: 0.2;
    }
  }
}

.newcard {
  color: #09c;
}

.back {
  border-top: 1px solid rgba(black, 0.15);
  transition: 0.2s;

  &.pointer {
    cursor: pointer;
  }

  .hideanswer {
    user-select: none;
    pointer-events: none;
    opacity: 0.15;
    filter: blur(7px);
  }
}

.card.mini {
  .textfield {
    font-size: 1rem;
    padding: 20px 35px;
    line-height: 1.2;
  }
}
</style>
