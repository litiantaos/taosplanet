<template>
	<view class="wrap" :class="{'reverse': reverse}">
		<view class="iconfont icon-like" :class="{'active': isLike, 'animation': isClick, 'small': isSmall}"
			@click.stop="onClick"></view>
		<view class="text">{{text}}</view>
	</view>
</template>

<script>
	export default {
		name: "like-handler",
		props: {
			isLike: {
				type: Boolean,
				default: false
			},
			isClick: {
				type: Boolean,
				default: false
			},
			text: {
				type: [String, Number],
				default: ""
			},
			reverse: {
				type: Boolean,
				default: false
			},
			isSmall: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {

			};
		},
		methods: {
			onClick() {
				this.$emit("click");
			}
		}
	}
</script>

<style lang="scss" scoped>
	.wrap {
		display: flex;
		align-items: center;

		&.reverse {
			flex-direction: row-reverse;
		}

		.iconfont {
			font-size: 36rpx;

			&.small {
				font-size: 34rpx;
			}

			&.active {
				color: $uni-color-primary;
			}

			&.animation {
				animation: likeActive .5s;

				@keyframes likeActive {
					0% {
						transform: scale(1);
					}

					60% {
						transform: scale(1.2);
					}

					100% {
						transform: scale(1);
					}
				}
			}
		}

		.text {
			font-size: 26rpx;
			color: #666;
			margin: 5rpx 20rpx 0 20rpx;
		}
	}
</style>