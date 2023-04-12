<template>
	<nav-bar></nav-bar>
	<safe-area></safe-area>

	<view class="container">
		<view class="title">
			<view>正在组局</view>
			<view class="add-btn iconfont icon-add" @click="createEvent"></view>
		</view>

		<view class="">
			<event-card @click="toEventDetail"></event-card>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {

			};
		},
		methods: {
			toEventDetail() {
				uni.navigateTo({
					url: "/pages-fun/event/event-detail/event-detail"
				});
			},
			createEvent() {
				uni.navigateTo({
					url: "/pages-fun/event/event-create/event-create"
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		padding: 25rpx;

		.title {
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: 80rpx;
			font-size: 45rpx;
			font-weight: bold;
			margin-bottom: 25rpx;

			.add-btn {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 100rpx;
				height: 50rpx;
				background: #333;
				border-radius: 25rpx;
				font-size: 24rpx;
				color: #fff;
			}
		}
	}
</style>