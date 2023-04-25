<template>
	<view v-if="isShow" class="load-view" :style="{background, opacity}">
		<i class="iconfont icon-ring"></i>
	</view>
</template>

<script>
	export default {
		name: "load-view",
		props: {
			isLoading: {
				type: Boolean,
				default: false
			},
			background: {
				type: String,
				default: "#f5f5f5"
			}
		},
		data() {
			return {
				isShow: false,
				opacity: 1
			};
		},
		mounted() {
			this.isShow = this.isLoading;
		},
		watch: {
			isLoading(newVal) {
				if (!newVal) {
					setTimeout(() => {
						this.opacity = 0;
						setTimeout(() => {
							this.isShow = false;
						}, 510);
					}, 500);
				} else {
					this.isShow = true;
					setTimeout(() => {
						this.opacity = 1;
					}, 10);
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.load-view {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 998;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100vw;
		height: 100vh;
		pointer-events: none;
		transition: opacity .3s;

		.iconfont {
			font-size: 40rpx;
			color: #999;
			animation: loading 1s linear infinite;

			@keyframes loading {
				0% {
					transform: rotate(0deg);
				}

				100% {
					transform: rotate(360deg);
				}
			}
		}
	}
</style>