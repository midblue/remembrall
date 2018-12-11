<template>
  <div
    class="card"
    :class="{ newcard: !totalReviews, checked, suspended }"
    @click="click"
  >
    <input type="checkbox" v-model="checked" />
    <div class="cardtext">{{ front }}</div>
    <div class="cardtext">{{ back }}</div>
    <div class="sub center">{{ $store.state.setList[set].name }}</div>
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
  },
  components: {
    CardTools,
  },
  data() {
    return {
      checked: false,
    }
  },
  computed: {
    isNewCard() {
      return !this.totalReviews || this.totalReviews === 0
    },
  },
  watch: {},
  methods: {
    click(e) {
      let isTools = false
      e.path.forEach(element => {
        if (element.classList && element.classList.contains('cardtools'))
          isTools = true
      })
      if (isTools) return
      this.checked = !this.checked
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

  &:nth-child(2n) {
    background: #fbfbfb;
  }

  &.checked {
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
