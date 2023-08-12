<template>
	<view class="container">
		<view class="title">你已成功发布了一个项目，你可以</view>
		<view class="button" @click="toProjectDetail">查看项目</view>
		<view class="text">或</view>
		<view class="button" @click="toPosition">招募伙伴</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				projectId: ""
			};
		},
		onLoad(e) {
			this.projectId = e.id;
		},
		methods: {
			toPosition() {
				uni.navigateTo({
					url: "/pages-project/position/position?id=" + this.projectId
				});
			},
			toProjectDetail() {
				uni.navigateTo({
					url: "/pages-project/project-detail/project-detail?id=" + this.projectId
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		height: 80vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		.button {
			padding: 15rpx 25rpx;
			background: #333;
			color: #fff;
			font-size: 24rpx;
			border-radius: 20rpx;
			margin-bottom: 25rpx;
		}

		.title {
			font-size: 28rpx;
			margin-bottom: 50rpx;
		}

		.text {
			font-size: 28rpx;
			margin-bottom: 25rpx;
		}
	}
</style>