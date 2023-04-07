<template>
	<view class="link" @click="onClick">
		<view class="link-image iconfont icon-link"></view>
		<view class="link-text">{{tempData}}</view>
		<view v-if="showRemove" class="iconfont icon-close-circle-fill delete-btn" @click.stop="handle"></view>
	</view>
</template>

<script>
	export default {
		name: "link-card",
		props: {
			data: {
				type: [Object, String]
			},
			showRemove: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				tempData: this.data
			};
		},
		methods: {
			onClick() {
				uni.navigateTo({
					url: "/pages/webview/webview?url=" + this.tempData
				});
				this.$emit("click");
			},
			handle() {
				this.$emit("handle");
			}
		}
	}
</script>

<style lang="scss" scoped>
	.link {
		height: 130rpx;
		width: 100%;
		padding: 0 60rpx 0 15rpx;
		background: #f5f5f5;
		border-radius: 15rpx;
		display: flex;
		align-items: center;
		margin-top: 25rpx;
		position: relative;

		.link-image {
			flex: 0 0 100rpx;
			height: 100rpx;
			background: #eee;
			border-radius: 10rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 36rpx;
			color: #666;
		}

		.link-text {
			font-size: 28rpx;
			color: #333;
			word-break: break-all;
			margin-left: 20rpx;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.delete-btn {
			position: absolute;
			top: 10rpx;
			right: 10rpx;
			font-size: 36rpx;
			color: #999;
			opacity: 0.6;
		}
	}
</style>