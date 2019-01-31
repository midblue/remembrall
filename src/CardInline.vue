<template>
  <div
    class="card"
    :class="{ newcard: !totalReviews, selected, suspended, noset: !showSet }"
    @click="click"
  >
    <input type="checkbox" v-model="selected" />
    <div class="cardtext">{{ shownFront }}</div>
    <div class="cardtext">{{ shownBack }}</div>
    <div class="sub center" v-if="showSet">
      {{ $store.state.setList[set].name }}
    </div>
    <div style="position: relative;">
      <CardTools
        :id="id"
        :setId="set"
        :totalReviews="totalReviews"
        :ok="ok"
        :front="front"
        :back="back"
        :nextReview="nextReview"
        :suspended="suspended"
        :imageURL="imageURL"
        @setImageURL="setImageURL"
        :left="true"
      />
    </div>
  </div>
</template>

<script>
import CardTools from './CardTools'

export default {
  props: {
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
    forceDeselect: {
      default: false,
    },
    showSet: {
      default: false,
    },
  },
  components: {
    CardTools,
  },
  data() {
    return {
      selected: false,
      shownFront: '',
      shownBack: '',
    }
  },
  computed: {
    isNewCard() {
      return !this.totalReviews || this.totalReviews === 0
    },
  },
  watch: {
    front() {
      this.updateText()
    },
    back() {
      this.updateText()
    },
    selected(isSelected) {
      if (isSelected) this.$emit('select', this.id)
      else this.$emit('deselect', this.id)
    },
    forceDeselect(mustDeselect) {
      if (mustDeselect) this.selected = false
    },
  },
  mounted() {
    this.updateText()
  },
  methods: {
    click(e) {
      let isTools = false
      e.path.forEach(element => {
        if (element.classList && element.classList.contains('cardtools'))
          isTools = true
      })
      if (isTools) return
      this.selected = !this.selected
    },
    updateText() {
      const ta = document.createElement('textarea')
      ta.innerHTML = this.front
      this.shownFront = ta.value
      ta.innerHTML = this.back
      this.shownBack = ta.value
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
input[type='checkbox'] {
  margin: 0;
  width: 100%;
  height: 100%;
}
.card {
  cursor: pointer;
  // border-bottom: 1px solid #eee;
  text-align: left;
  position: relative;
  overflow: initial;
  display: grid;
  grid-template-columns: 20px 30% 1fr 15% 30px;
  grid-gap: 10px;
  line-height: 1.3;

  &.noset {
    grid-template-columns: 20px 40% 1fr 30px;
  }

  &:nth-child(2n) {
    background: #fbfbfb;
  }

  &.selected {
    background: #eee;
  }

  & > * {
    height: 100%;
    padding: 12px 0;
    display: flex;
    align-items: center;
  }
}
.newcard {
  color: #09c;
}
.center {
  text-align: center;
}

.card.suspended {
  .cardtext {
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
    font-size: 1.4rem;
    opacity: 1;
    color: #888;
  }
}
</style>
