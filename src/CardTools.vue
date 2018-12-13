<template>
  <div
    class="cardtools"
    v-if="id"
    @mouseover="mouseover"
    @click="toggle"
    @mouseout="mouseout"
  >
    <div class="icon" :class="{ open }">
      <svg
        width="50px"
        height="50px"
        viewBox="0 0 50 50"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
      >
        <g fill="#000000" fill-rule="evenodd">
          <path
            d="M25,33.76 C26.5600078,33.76 28.0199932,33.360004 29.38,32.56 C30.7400068,31.759996 31.819996,30.6900067 32.62,29.35 C33.420004,28.0099933 33.82,26.5600078 33.82,25 C33.82,23.4399922 33.420004,21.9800068 32.62,20.62 C31.819996,19.2599932 30.7400068,18.180004 29.38,17.38 C28.0199932,16.579996 26.5600078,16.18 25,16.18 C23.4399922,16.18 21.9900067,16.579996 20.65,17.38 C19.3099933,18.180004 18.240004,19.2599932 17.44,20.62 C16.639996,21.9800068 16.24,23.4399922 16.24,25 C16.24,26.5600078 16.639996,28.0099933 17.44,29.35 C18.240004,30.6900067 19.3099933,31.759996 20.65,32.56 C21.9900067,33.360004 23.4399922,33.76 25,33.76 Z M43.66,27.46 L48.88,31.54 C49.1200012,31.740001 49.2599998,31.9999984 49.3,32.32 C49.3400002,32.6400016 49.2800008,32.9399986 49.12,33.22 L44.08,41.86 C43.9199992,42.1400014 43.7100013,42.3199996 43.45,42.4 C43.1899987,42.4800004 42.9000016,42.4600006 42.58,42.34 L36.4,39.88 C34.799992,41.0400058 33.3800062,41.8599976 32.14,42.34 L31.24,48.88 C31.1599996,49.2000016 31.0100011,49.459999 30.79,49.66 C30.5699989,49.860001 30.3200014,49.96 30.04,49.96 L19.96,49.96 C19.6799986,49.96 19.4300011,49.860001 19.21,49.66 C18.9899989,49.459999 18.8600002,49.2000016 18.82,48.88 L17.86,42.34 C16.1799916,41.6599966 14.7800056,40.8400048 13.66,39.88 L7.42,42.34 C6.7799968,42.6200014 6.2800018,42.460003 5.92,41.86 L0.88,33.22 C0.7199992,32.9399986 0.6599998,32.6400016 0.7,32.32 C0.7400002,31.9999984 0.8799988,31.740001 1.12,31.54 L6.4,27.46 C6.3199996,26.8999972 6.28,26.0800054 6.28,25 C6.28,23.9199946 6.3199996,23.1000028 6.4,22.54 L1.12,18.46 C0.8799988,18.259999 0.7400002,18.0000016 0.7,17.68 C0.6599998,17.3599984 0.7199992,17.0600014 0.88,16.78 L5.92,8.14 C6.2800018,7.539997 6.7799968,7.3799986 7.42,7.66 L13.66,10.12 C15.1000072,9.0399946 16.4999932,8.2200028 17.86,7.66 L18.82,1.12 C18.8600002,0.7999984 18.9899989,0.540001 19.21,0.34 C19.4300011,0.139999 19.6799986,0.04 19.96,0.04 L30.04,0.04 C30.3200014,0.04 30.5699989,0.139999 30.79,0.34 C31.0100011,0.540001 31.1599996,0.7999984 31.24,1.12 L32.14,7.66 C33.7000078,8.260003 35.1199936,9.0799948 36.4,10.12 L42.58,7.66 C42.9000016,7.5399994 43.1899987,7.5199996 43.45,7.6 C43.7100013,7.6800004 43.9199992,7.8599986 44.08,8.14 L49.12,16.78 C49.2800008,17.0600014 49.3400002,17.3599984 49.3,17.68 C49.2599998,18.0000016 49.1200012,18.259999 48.88,18.46 L43.66,22.54 C43.7400004,23.1000028 43.78,23.9199946 43.78,25 C43.78,26.0800054 43.7400004,26.8999972 43.66,27.46 Z"
          ></path>
        </g>
      </svg>
      <div class="panel" :class="{ open, left }">
        <div class="stats sub">
          <template v-if="totalReviews > 0">
            <div>
              {{ totalReviews }} review{{ totalReviews === 1 ? '' : 's' }}
            </div>
            <div>{{ parseInt((ok / totalReviews) * 100) }}% success</div>
            <!-- <div>Next review: {{ msToString(nextReview) }}</div> -->
          </template>
          <div v-else>This card is new.</div>
        </div>
        <div class="button" @click="swapSides">Swap Front/Back</div>
        <div
          class="button"
          ref="movetobutton"
          v-if="allSets.length > 1"
          @mouseover="isMobile ? false : (moveToSetOpen = true)"
          @click="isMobile ? (moveToSetOpen = !moveToSetOpen) : false"
          @mouseout="isMobile ? false : (moveToSetOpen = false)"
        >
          Move to Set...
          <div
            class="secondarypanel"
            :class="{ mobile: isMobile }"
            v-if="moveToSetOpen"
          >
            <div
              v-for="set in allSets"
              v-if="set.id != realSetId"
              class="button"
              @key="set.id"
              @click="moveToSet(set.id)"
            >
              {{ set.name }}
            </div>
          </div>
        </div>
        <div class="button" @click="suspendCard">
          {{ suspended ? 'Unsuspend Card' : 'Suspend Card' }}
        </div>
        <div class="button" @click="deleteCard">Delete Card</div>
      </div>
    </div>
  </div>
  <div
</template>

<script>
import { msToString } from './assets/commonFunctions'

export default {
  props: {
    id: {
      required: true,
    },
    setId: {
      required: true,
    },
    totalReviews: { default: 0 },
    ok: { default: 0 },
    front: {},
    back: {},
    nextReview: {},
    suspended: {},
    left: {
      default: false,
    },
  },
  data() {
    return { open: false, moveToSetOpen: false, realSetId: this.setId }
  },
  computed: {
    isMobile() {
      return this.$store.state.isMobile
    },
    settings() {
      return this.$store.state.setList[this.$store.state.currentSetId].settings
    },
    allSets() {
      const allSetsObject = this.$store.state.setList
      const allSetsArray = []
      for (let setId in allSetsObject) {
        allSetsArray.push({ id: setId, name: allSetsObject[setId].name })
      }
      return allSetsArray
    },
  },
  watch: {
    id() {
      this.open = false
    },
  },
  mounted() {},
  methods: {
    msToString,
    toggle(e) {
      if (
        this.$store.state.isMobile &&
        !e.path.includes(this.$refs.movetobutton)
      )
        this.open = !this.open
      if (this.open) window.addEventListener('click', this.checkClickToClose)
      else window.removeEventListener('click', this.checkClickToClose)
    },
    mouseover() {
      if (!this.$store.state.isMobile) this.open = true
    },
    mouseout() {
      if (!this.$store.state.isMobile) this.open = false
    },
    swapSides() {
      this.$store.commit('updateCard', {
        id: this.id,
        front: this.back,
        back: this.front,
      })
      this.open = false
    },
    moveToSet(toId) {
      this.$store.commit('moveCard', {
        id: this.id,
        from: this.realSetId,
        to: toId,
      })
      this.open = false
      this.realSetId = toId
    },
    suspendCard() {
      this.$store.commit('updateCard', {
        id: this.id,
        suspended: this.suspended ? false : true,
      })
      this.open = false
    },
    deleteCard() {
      this.$store.commit('deleteCard', this.id)
      this.$emit('done')
      this.showBack = false
      this.$nextTick(() => {
        try {
          this.$refs.deleteButton.blur()
        } catch (e) {}
      })
      this.open = false
    },
    checkClickToClose(e) {
      if (!e.path.includes(this.$el)) this.open = false
    },
  },
}
</script>
<style scoped lang="scss">
.button {
  position: relative;
  user-select: none;
  padding: 12px 5px;
  border-top: 1px solid #ddd;
  cursor: pointer;
  text-align: center;
  width: 150px;
  background: #eee;

  &:hover {
    background: #ddd;
  }
  &:first-of-type {
    border-top-right-radius: 10px;
  }
  &:last-of-type {
    border-bottom-right-radius: 10px;
    border-bottom-left-radius: 10px;
  }
  &:first-of-type:last-of-type {
    border-bottom-left-radius: 0;
  }
  &:first-child {
    border-top: none;
  }
}

.cardtools {
  .icon {
    cursor: pointer;
    width: 30px;
    height: 30px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;

    svg {
      z-index: 2;
      width: 50%;
      height: 50%;
      opacity: 0.1;
    }

    &.open {
      z-index: 3;
      background: #eee;
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
    }
  }
  .panel {
    &:not(.open) {
      display: none;
    }

    color: black;
    position: absolute;
    top: 100%;
    left: 0px;
    width: 150px;
    border-radius: 10px;
    border-top-left-radius: 0px;
    background: #eee;

    &.left {
      left: auto;
      right: 0px;
      border-radius: 10px;
      border-top-right-radius: 0px;
    }

    .stats {
      padding: 10px 20px;
    }
  }
}
.secondarypanel {
  position: absolute;
  left: 100%;
  top: 0px;

  &.mobile {
    position: relative;
    left: -5px;
    top: 12px;
    color: #555;
    font-size: 0.85em;

    .button {
      &:before {
        color: #555;
        content: '→';
      }
      border-radius: 0;
    }
  }
}
</style>
