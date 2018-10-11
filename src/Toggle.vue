<template>
  <div
    class="toggle"
    :class="{ on, }"
    @click="toggle"
  >
		<div class="icon"></div>
		<div v-if="label" class="label">{{ label }}</div>
	</div>
</template>

<script>

export default {
  props: {
    setTo: {
			required: false,
			type: Boolean,
			default: false,
		},
		label: {
			required: false,
			type: String,
		}
  },
  components: {

  },
  data () {
    return {
      on: this.setTo
    }
  },
  computed: {
    
  },
	watch: {
		setTo (newOnValue) {
			if (this.on !== newOnValue)
				this.toggle()
		}
	},
  methods: {
    toggle () {
			this.on = !this.on
			this.$emit('toggled', this.on)
		}
  }
}
</script>

<style lang="scss" scoped>
  .toggle {
		display: grid;
		grid-template-columns: 60px 1fr;
		grid-gap: 10px;
		cursor: pointer;

		.icon {
			$height: 1.7rem;

			position: relative;
			width: 3.7rem;
			height: $height;
			border: 1px solid #bbb;
			border-radius: $height / 2;
			z-index: 1;
			transition: .3s;

			&:before {
				content: 'ON\00a0\00a0\00a0OFF';
				position: absolute;
				left: 12%;
				top: 24%;
				font-size: .65rem;
				font-weight: 800;
				opacity: .5;
				z-index: 1;
				transition: .3s;
			}

			&:after {
				$dotheight: 1.4rem;
				content: '';
				position: absolute;
				left: 5%;
				top: 6%;
				width: $dotheight;
				height: $dotheight;
				z-index: 2;
				background: #bbb;
				border-radius: $dotheight / 2;
				transition: .3s;
			}
		}
		&.on .icon {
			border: 1px solid transparent;
			background: #4c4;

			&:before {
				color: white;
				opacity: 1;
			}

			&:after {
				left: 58%;
				background: white;
			}
		}

		.label {
			margin-top: .1rem;
			user-select: none;
			font-weight: 600;
		}

  }
</style>

