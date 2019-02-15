<template>
  <button
    @mouseover="isMobile ? false : (paneOpen = true)"
    @click="isMobile ? (paneOpen = !paneOpen) : false"
    @mouseout="mouseOut"
  >
    {{ label }}
    <div class="secondarypanel" ref="secondaryPanel" v-if="paneOpen">
      <slot></slot>
    </div>
  </button>
</template>

<script>
export default {
  props: {
    label: {
      required: true,
    },
  },
  components: {},
  data() {
    return {
      paneOpen: false,
    }
  },
  computed: {
    isMobile() {
      return this.$store.state.isMobile
    },
  },
  mounted() {},
  beforeDestroy() {},
  methods: {
    mouseOut(e) {
      if (!this.isMobile) {
        if (
          e.toElement === this.$el ||
          e.toElement.parentNode === this.$el ||
          e.toElement.parentNode === this.$refs.secondaryPanel
        )
          return
        this.paneOpen = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
button {
  border-radius: 0 !important;
}
.secondarypanel {
  position: absolute;
  left: 0;
  top: 100%;
  background: #f5f5f5;
  width: 100%;

  & > div {
    width: 100%;
    overflow: hidden;
    text-align: center;
    padding: 10px 15px;

    &:hover {
      background: #eee;
    }
  }
}
</style>
