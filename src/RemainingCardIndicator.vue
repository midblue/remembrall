<template>
  <div
    class="remainingcards"
  >
		<div
			v-for="key in ((startedWith - toStudy.length) > 0 ? (startedWith - toStudy.length) : 0)"
			:key="key"
			class="card"
		></div>
    <div
			v-for="card, key in toStudy"
			:key="card.id"
			class="card"
			:class="{review: card.totalReviews, new: !card.totalReviews, current: key === 0}"
		></div>
  </div>
</template>

<script>
export default {
  props: {
    toStudy: {},
    startedWith: {},
  },
  components: {},
  data() {
    return {}
  },
  computed: {},
  watch: {},
  mounted() {},
  beforeDestroy() {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.remainingcards {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 10px;
  position: relative;
  margin: 10px 0 20px 0;

  .card {
    flex-shrink: 1;
    flex-grow: 0;
    width: 4px;
    height: 4px;
    background: #ddd;
    opacity: 0.5;

    &.review {
      background: #bbb;

      &.current {
        // background: #0d0;
        opacity: 1;
      }
    }

    &.new {
      background: #999;

      &.current {
        // background: #0cc;
        opacity: 1;
      }
    }

    &.current {
      flex-shrink: 0;
      width: 15px;
      height: 10px;
      border-radius: 7.5px;
    }
  }
}
</style>
