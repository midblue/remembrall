<template>
  <div class="card roundframe" :class="{ new: !totalReviews, mini, suspended }">
    <CardTools
      :id="id"
      :totalReviews="totalReviews"
      :ok="ok"
      :front="front"
      :back="back"
      :nextReview="nextReview"
      :setId="set"
      :suspended="suspended"
      :imageURL="imageURL"
      @setImageURL="setImageURL"
      class="topleft"
    />
    <div class="front">
      <EditableTextFieldMarkdown
        class="textfield"
        :class="{
          newcard: isNewCard,
        }"
        :text="reverse ? back : front"
        @startEdit="startEdit"
        @endEdit="saveEditedCard(reverse ? 'back' : 'front', ...arguments)"
        @setImageURL="setImageURL"
      />
      <ImageLoader :url="imageURL" v-if="imageURL && !reverse" />
      <StudyExtras
        v-if="reverse && settings.languageTools && forStudy"
        :text="back"
        :secondaryText="front"
      />
    </div>
    <div
      class="back"
      :class="{ pointer: showBack === false && forStudy }"
      @click="$emit('showBack')"
    >
      <div :class="{ hideanswer: !showBack && forStudy }">
        <EditableTextFieldMarkdown
          class="textfield"
          :class="{
            newcard: isNewCard,
          }"
          :text="reverse ? front : back"
          @startEdit="startEdit"
          @endEdit="saveEditedCard(reverse ? 'front' : 'back', ...arguments)"
          @setImageURL="setImageURL"
        />
        <ImageLoader :url="imageURL" v-if="imageURL && reverse" />
        <StudyExtras
          v-if="!reverse && settings.languageTools && forStudy"
          :text="back"
          :secondaryText="front"
          :shown="showBack"
        />
      </div>
    </div>
  </div>
</template>

<script>
import EditableTextFieldMarkdown from './EditableTextFieldMarkdown'
import CardTools from './CardTools'
import StudyExtras from './StudyExtras'
import ImageLoader from './ImageLoader'

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
    suspended: {
      default: false,
    },
    imageURL: {},
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
    EditableTextFieldMarkdown,
    CardTools,
    StudyExtras,
    ImageLoader,
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
    setImageURL(url) {
      this.$store.commit('updateCard', {
        id: this.id,
        imageURL: url,
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

.topleft {
  position: absolute;
  top: 0px;
  left: 0px;
}

.front,
.back {
  transition: 0.2s;
  overflow: hidden;
  background: #f8f8f8;
  position: relative;
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
  font-size: 1.5rem;
  transition: padding 0.5s;

  @media (max-width: 768px) {
    padding: 35px 25px;
    font-size: 1.4rem;
  }

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
    padding: 20px 30px;
    line-height: 1.2;
  }
  .back .textfield {
    padding: 20px 15px;
  }
  img {
    margin-top: -10px;
    max-width: 80%;
    max-height: 100px;
  }
}

.card.suspended {
  position: relative;

  .textfield {
    background: #f5f5f5;
    color: #bbb;
  }

  &:after {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    content: 'SUSPENDED';
    user-select: none;
    pointer-events: none;
    font-weight: 600;
    font-size: 1.7rem;
    opacity: 1;
    color: #888;
  }
}
</style>
