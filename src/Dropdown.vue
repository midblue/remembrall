<template>
  <button
    @mouseover="isMobile ? false : (paneOpen = true)"
    @click="isMobile ? (paneOpen = !paneOpen) : false"
    @mouseleave="isMobile ? false : (paneOpen = false)"
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
  methods: {},
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
