<template>
	<view class="container">
		<view class="group">
			<view class="item-wrap">
				<text class="title">系统消息</text>
				<view class="value-wrap">
					<text class="value"></text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
		</view>

		<view class="group">
			<view class="item-wrap">
				<text class="title">ZHEN 评论了你的动态</text>
				<view class="value-wrap">
					<text class="value"></text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>

			<view class="item-wrap">
				<text class="title">WAN 点赞了你的动态</text>
				<view class="value-wrap">
					<text class="value"></text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
		</view>
	</view>

	<tab-bar :index="2"></tab-bar>
</template>

<script>
	export default {
		data() {
			return {

			};
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		padding: 20rpx;

		.group {
			border-radius: 20rpx;
			overflow: hidden;
			margin-bottom: 20rpx;

			.item-wrap {
				height: 120rpx;
				padding: 20rpx;
				display: flex;
				justify-content: space-between;
				align-items: center;
				background: #fff;

				.title {
					font-size: 28rpx;
				}

				.value-wrap {
					display: flex;
					justify-content: flex-end;
					align-items: center;

					.value {
						margin: 0 20rpx;
						font-size: 28rpx;
						color: #666;
					}

					.iconfont {
						font-size: 28rpx;
					}
				}
			}
		}
	}
</style>