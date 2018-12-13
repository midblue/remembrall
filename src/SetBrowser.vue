<template>
  <div class="cardbrowser">
    <Browser :cards="setCards" />
    <button @click="$store.commit('setAppState', 'addCard')" class="add">
      <div>Add Card</div>
    </button>
  </div>
</template>

<script>
import Browser from './Browser'

export default {
  components: {
    Browser,
  },
  computed: {
    setCards() {
      return this.$store.state.setList[this.$store.state.currentSetId].cards
    },
  },
}
</script>

<style lang="scss" scoped>
.cardbrowser {
  position: relative;
  margin: 0 auto;
  transition: all 0.5s;
  margin-bottom: 200px;
  font-size: 1rem;
}
.add {
  margin-top: 40px;
  width: 100%;
}
</style>
