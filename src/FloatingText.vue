<template>
	<div
    class="floattext" 
    v-if="textToFloat"
    :style="{
      transform: `translateY(${ offset }px)`,
      color,
    }"
  >
		{{ textToFloat }}
	</div>
</template>

<script>
export default {
  props: {
    text: {},
    offset: {
      default: 0,
    },
    color: {
      default: 'green',
    },
  },
  data() {
    return {
      textToFloat: null,
    }
  },
  watch: {
    text(newText) {
      this.textToFloat = null
      this.$nextTick(() => (this.textToFloat = this.text))
    },
  },
}
</script>

<style lang="scss" scoped>
.floattext {
  z-index: 1000;
  width: 100%;
  left: 0;
  position: absolute;
  text-align: center;
  user-select: none;
  pointer-events: none;
  font-weight: 600;
  animation: pointsscroll 1.5s normal forwards ease-out;
}

@keyframes pointsscroll {
  from {
    opacity: 0;
    bottom: 0px;
  }
  50% {
    opacity: 1;
  }
  to {
    opacity: 0;
    bottom: 100px;
  }
}
</style>
