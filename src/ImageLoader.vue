<template>
  <div v-if="!hide">
    <svg
      v-if="!loaded"
      width="105"
      height="105"
      viewBox="0 0 105 105"
      xmlns="http://www.w3.org/2000/svg"
      fill="#333"
    >
      <circle cx="12.5" cy="12.5" r="12.5">
        <animate
          attributeName="fill-opacity"
          begin="0s"
          dur="1s"
          values="1;.2;1"
          calcMode="linear"
          repeatCount="indefinite"
        ></animate>
      </circle>
      <circle cx="12.5" cy="52.5" r="12.5" fill-opacity="0.5">
        <animate
          attributeName="fill-opacity"
          begin="100ms"
          dur="1s"
          values="1;.2;1"
          calcMode="linear"
          repeatCount="indefinite"
        ></animate>
      </circle>
      <circle cx="52.5" cy="12.5" r="12.5">
        <animate
          attributeName="fill-opacity"
          begin="300ms"
          dur="1s"
          values="1;.2;1"
          calcMode="linear"
          repeatCount="indefinite"
        ></animate>
      </circle>
      <circle cx="52.5" cy="52.5" r="12.5">
        <animate
          attributeName="fill-opacity"
          begin="600ms"
          dur="1s"
          values="1;.2;1"
          calcMode="linear"
          repeatCount="indefinite"
        ></animate>
      </circle>
      <circle cx="92.5" cy="12.5" r="12.5">
        <animate
          attributeName="fill-opacity"
          begin="800ms"
          dur="1s"
          values="1;.2;1"
          calcMode="linear"
          repeatCount="indefinite"
        ></animate>
      </circle>
      <circle cx="92.5" cy="52.5" r="12.5">
        <animate
          attributeName="fill-opacity"
          begin="400ms"
          dur="1s"
          values="1;.2;1"
          calcMode="linear"
          repeatCount="indefinite"
        ></animate>
      </circle>
      <circle cx="12.5" cy="92.5" r="12.5">
        <animate
          attributeName="fill-opacity"
          begin="700ms"
          dur="1s"
          values="1;.2;1"
          calcMode="linear"
          repeatCount="indefinite"
        ></animate>
      </circle>
      <circle cx="52.5" cy="92.5" r="12.5">
        <animate
          attributeName="fill-opacity"
          begin="500ms"
          dur="1s"
          values="1;.2;1"
          calcMode="linear"
          repeatCount="indefinite"
        ></animate>
      </circle>
      <circle cx="92.5" cy="92.5" r="12.5">
        <animate
          attributeName="fill-opacity"
          begin="200ms"
          dur="1s"
          values="1;.2;1"
          calcMode="linear"
          repeatCount="indefinite"
        ></animate>
      </circle>
    </svg>
    <img :src="url" v-else>
  </div>
</template>

<script>
export default {
  props: {
    url: {
      required: true,
    },
  },
  data() {
    return {
      loaded: false,
      hide: false,
    }
  },
  watch: {
    url(newURL) {
      this.loaded = false
      this.loadImg(newURL)
    },
  },
  mounted() {
    this.loadImg(this.url)
  },
  methods: {
    loadImg(url) {
      const img = new Image()
      img.onload = () => {
        this.loaded = true
      }
      img.onerror = () => {
        console.log('Failed to load card image', url)
        this.hide = true
      }
      img.src = url
    },
  },
}
</script>

<style lang="scss" scoped>
svg {
  opacity: 0.3;
  width: 30px !important;
}
img {
  margin: 0 auto;
  max-width: 90%;
  max-height: 250px;
  padding-bottom: 10px;
  transition: all 0.5s;

  @media (max-width: 768px) {
    max-height: 200px;
    padding-bottom: 5px;
  }
}
</style>
