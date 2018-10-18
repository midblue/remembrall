<template>
  <div
    class="reviewgraph"
  >
		<h4 v-if="reviewGraph.graphPoints">{{ title }}</h4>
		<div class="bars">
			<div
				v-for="bar, key in reviewGraph.graphPoints"
				:key="'bar' + key"
				:style="{height: ((bar / reviewGraph.maxValue) * 100) + '%' }"
			>
				<div class="count">{{ bar }}</div>
			</div>
		</div>
		<div class="labels">
			<span
				class="sub"
				v-for="label, key in reviewGraph.labels"
				:key="'label' + key"
			>{{
				label
			}}
			</span>
		</div>
  </div>
</template>

<script>
import { msToString } from './assets/commonFunctions'

export default {
  props: {
    cards: {},
    slots: {
      default: 10,
    },
    maxTime: {
      default: null,
    },
    title: {
      default: 'All upcoming reviews:',
    },
  },
  components: {},
  data() {
    return {
      updateGraphTimer: null,
      reviewGraph: {},
    }
  },
  watch: {
    cards() {
      this.updateGraph()
    },
  },
  mounted() {
    this.updateGraphTimer = setInterval(this.updateGraph, 30000)
    this.updateGraph()
  },
  beforeDestroy() {
    clearInterval(this.updateGraphTimer)
  },
  methods: {
    updateGraph() {
      if (!this.cards || this.cards.length === 0) return
      const now = Date.now()
      const reviewTimes = this.cards.map(
        card => parseInt(card.nextReview) - now
      )
      const greatestTime = this.maxTime
        ? this.maxTime
        : Math.max(...reviewTimes)
      const graphPoints = []
      const labels = []
      for (let x = 0; x < this.slots; x++) {
        graphPoints[x] = 0
        labels[this.slots - 1 - x] = msToString(
          greatestTime - (greatestTime / this.slots) * (x + 0.5)
        )
      }
      for (let time of reviewTimes) {
        const bucket = Math.floor((time / greatestTime) * (this.slots - 1))
        if (bucket >= this.slots) continue
        if (!graphPoints[bucket]) graphPoints[bucket] = 1
        else graphPoints[bucket]++
      }
      const maxValue = Math.max(...graphPoints)
      this.reviewGraph = {
        graphPoints,
        labels,
        maxValue,
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.reviewgraph {
  width: 100%;
  margin-bottom: 30px;

  .bars {
    height: 70px;
    display: flex;
    justify-content: stretch;
    align-items: flex-end;

    & > * {
      flex: 1;
      background: #ddd;
      margin: 0 3px;
      position: relative;
    }
  }

  .count {
    font-size: 0.8em;
    opacity: 0.3;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%) translateY(-93%);
  }

  .labels {
    margin-top: 2px;
    display: flex;
    justify-content: stretch;
    text-align: center;

    & > * {
      flex: 1;
    }
  }
}
</style>
