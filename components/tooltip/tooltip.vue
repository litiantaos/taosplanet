<template>
	<view v-if="isShow" class="tooltip-wrap" @click="hide">
		<view class="tooltip" :style="{top: `${top}px`, opacity: opacity, transform: `translateY(${translateY}rpx)`}"
			@click.stop="hide">
			<view class="text">
				<view>点击右上角 <view class="iconfont icon-more-dot more"></view> 选择「转发</view>
				<view>给朋友」或「分享到朋友圈」</view>
			</view>

			<view class="icon-wrap" style="margin-right: 20rpx;">
				<view class="icon">
					<view class="iconfont icon-share-arrow share"></view>
				</view>
				<view class="label">转发给朋友</view>
			</view>

			<view class="icon-wrap">
				<view class="icon">
					<image class="image" src="../../static/images/wx_timeline.svg" mode="aspectFill"></image>
				</view>
				<view class="label">分享到朋友圈</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "tooltip",
		data() {
			return {
				isShow: false,
				top: 0,
				opacity: 0,
				translateY: 100
			};
		},
		mounted() {
			let {
				screenHeight,
				statusBarHeight
			} = getApp().globalData.systemInfo;

			let {
				windowHeight
			} = uni.getSystemInfoSync();

			if (windowHeight == screenHeight - statusBarHeight - 44) {
				this.top = 15;
			} else {
				this.top = statusBarHeight + 48;
			}
		},
		methods: {
			show() {
				this.isShow = true;

				setTimeout(() => {
					this.opacity = 1;
					this.translateY = 0;
				}, 100);
			},
			hide() {
				this.opacity = 0;

				setTimeout(() => {
					this.isShow = false;
					this.translateY = 100;
				}, 500);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.tooltip-wrap {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 1002;

		.tooltip {
			position: fixed;
			right: 10px;
			padding: 25rpx;
			background: #f5f5f5;
			border-radius: 20rpx;
			display: flex;
			align-items: center;
			transition: opacity .3s, transform .3s;

			&::after {
				content: "";
				width: 30rpx;
				height: 30rpx;
				background: #f5f5f5;
				border-radius: 5rpx;
				position: absolute;
				top: -10rpx;
				right: 100rpx;
				transform: rotateZ(45deg);
				z-index: -1;
			}

			.text {
				font-size: 28rpx;
				color: #333;
				line-height: 50rpx;
				white-space: nowrap;
				margin-right: 25rpx;

				.more {
					display: inline-block;
					font-size: 50rpx;
					vertical-align: bottom;
				}
			}

			.icon-wrap {
				display: flex;
				flex-direction: column;
				align-items: center;

				.icon {
					width: 100rpx;
					height: 100rpx;
					background: #fff;
					border-radius: 20rpx;
					display: flex;
					justify-content: center;
					align-items: center;

					.share {
						font-size: 45rpx;
						color: #2aae67;
					}

					.image {
						width: 50rpx;
						height: 50rpx;
					}
				}

				.label {
					font-size: 20rpx;
					color: #999;
					margin-top: 15rpx;
				}
			}
		}
	}
</style>