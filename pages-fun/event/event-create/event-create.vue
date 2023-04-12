<template>
	<view class="container">
		<view class="group">
			<view class="item-wrap" @click="editRegion">
				<text class="title">活动主题</text>
				<view class="value-wrap">
					<text class="value">输入主题</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
			<view class="item-wrap" @click="editStatus">
				<text class="title">活动时间</text>
				<view class="value-wrap">
					<text class="value">选择时间</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
			<view class="item-wrap" @click="editStatus">
				<text class="title">招募截止时间</text>
				<view class="value-wrap">
					<text class="value">选择时间</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
		</view>

		<view class="group" @click="toUserIntro">
			<view class="item-wrap">
				<text class="title">活动说明</text>
				<view class="value-wrap">
					<text class="value">{{userInfo.intro ? "" : "填写简介"}}</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
			<view class="desc">
				<text>大家一起来玩</text>
			</view>
		</view>

		<view class="group">
			<view class="item-wrap" @click="editRegion">
				<text class="title">参与人数</text>
				<view class="value-wrap">
					<text class="value">输入数量</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
			<view class="item-wrap" @click="editStatus">
				<text class="title">活动地点</text>
				<view class="value-wrap">
					<text class="value">选择地点</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
			<view class="item-wrap" @click="editStatus">
				<text class="title">添加图片</text>
				<view class="value-wrap">
					<text class="value">选择图片</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
		</view>
	</view>
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
		padding: 25rpx;

		.group {
			border-radius: 20rpx;
			overflow: hidden;
			margin-bottom: 20rpx;

			button {
				all: unset;
				box-sizing: border-box;

				&::after {
					display: none;
				}
			}

			.item-wrap {
				height: 120rpx;
				padding: 25rpx;
				display: flex;
				justify-content: space-between;
				align-items: center;
				background: #fff;
				transition: background .15s;

				&:active {
					background: #eee;
				}

				.title {
					font-size: 28rpx;
					font-weight: bold;
					flex: 0 0 150rpx;
				}

				.value-wrap {
					display: flex;
					justify-content: flex-end;
					align-items: center;

					.value {
						font-size: 28rpx;
						color: #666;
					}

					.iconfont {
						font-size: 30rpx;
						font-weight: bold;
						line-height: 100%;
						margin-left: 20rpx;
					}
				}
			}

			.desc {
				padding: 0 25rpx 25rpx;
				background: #fff;
				font-size: 28rpx;
				color: #999;
				line-height: 50rpx;
			}
		}
	}
</style>