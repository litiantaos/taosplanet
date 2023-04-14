<template>
	<view class="wrap">
		<view v-if="left" class="text left">{{text}}</view>
		<view class="iconfont icon-like" :class="{'active': isLike, 'animation': isClick}" @click.stop="onClick"></view>
		<view v-if="!left" class="text right">{{text}}</view>
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
				default: "0"
			},
			left: {
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
		color: #666;

		.iconfont {
			font-size: 36rpx;

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
			margin-top: 5rpx;

			&.left {
				margin-right: 20rpx;
			}

			&.right {
				margin-left: 20rpx;
			}
		}
	}
</style>