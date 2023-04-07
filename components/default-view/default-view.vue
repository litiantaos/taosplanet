<template>
	<view class="container">
		<image class="image" src="@/static/images/default.svg" mode="widthFix"></image>
		<view v-if="showText" class="text">{{text}}</view>
	</view>
</template>

<script>
	export default {
		name: "default-view",
		props: {
			showText: {
				type: Boolean,
				default: false
			},
			text: {
				type: String,
				default: "暂无内容"
			}
		},
		data() {
			return {

			};
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		opacity: 0.8;

		.image {
			width: 50%;
			margin-top: 120rpx;
		}

		.text {
			font-size: 24rpx;
			color: #999;
			margin-top: 30rpx;
		}
	}
</style>