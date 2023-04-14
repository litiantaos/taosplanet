<template>
	<view class="float-btn" :class="theme"
		:style="[`--bottom-height: ${bottomHeight};`, {transform: (offsetY ? 'translate(-50%, 300%)' : 'translate(-50%, 0)')}]"
		@click="onClick" @longpress="onLongPress">
		<view v-if="text" class="text">{{text}}</view>
		<view v-else class="iconfont icon-add icon"></view>
	</view>
</template>

<script>
	export default {
		name: "float-button",
		props: {
			theme: {
				type: String,
				default: "light"
			},
			text: {
				type: String,
				default: ""
			},
			bottomHeight: {
				type: String,
				default: "58px"
			}
		},
		data() {
			return {
				offsetY: false,
				startScrollTop: 0,
				endScrollTop: 0
			};
		},
		mounted() {
			uni.$on("onPageScroll", e => {
				this.setOffset(e);
			});
		},
		methods: {
			setOffset(e) {
				setTimeout(() => {
					this.startScrollTop = e;
					setTimeout(() => {
						this.endScrollTop = e;
					}, 1000);
				}, 10);

				if (this.startScrollTop > this.endScrollTop) {
					this.offsetY = true;
				} else if (this.startScrollTop < this.endScrollTop) {
					this.offsetY = false;
				}
			},
			onClick() {
				this.$emit("click");
			},
			onLongPress() {
				this.$emit("longpress");
			}
		}
	}
</script>

<style lang="scss" scoped>
	.float-btn {
		min-width: 120rpx;
		height: 56rpx;
		padding: 0 30rpx;
		border-radius: 28rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		position: fixed;
		left: 50%;
		bottom: calc(env(safe-area-inset-bottom) + var(--bottom-height));
		z-index: 998;
		transform: translate(-50%, 0);
		transition: transform .5s;

		&.light {
			background: #eee;
			opacity: 0.9;
			filter: invert(10%);
			color: #999;
		}

		&.dark {
			background: #333;
			color: #fff;
		}

		&.red {
			background: #dd524d;
			color: #fff;
		}

		.text {
			font-size: 22rpx;
		}

		.icon {
			font-size: 32rpx;
			font-weight: bold;
		}
	}
</style>