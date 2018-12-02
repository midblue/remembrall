<template>
  <div class="card" :class="{ newcard: !totalReviews, checked }" @click="click">
    <input type="checkbox" v-model="checked" />
    <div>{{ front }}</div>
    <div>{{ back }}</div>
    <div class="sub center">{{ setName }}</div>
    <div style="position: relative;">
      <CardTools
        :id="id"
        :set="set"
        :totalReviews="totalReviews"
        :ok="ok"
        :front="front"
        :back="back"
        :nextReview="nextReview"
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
    setName: {},
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
</style>
