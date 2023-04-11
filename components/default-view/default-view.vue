<template>
	<view class="container" :class="fullScreen ? 'full' : 'nfull'">
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
				default: true
			},
			text: {
				type: String,
				default: "暂无内容"
			},
			fullScreen: {
				type: Boolean,
				default: false
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

		&.full {
			height: 100vh;
		}

		&.nfull {
			height: 600rpx;
		}

		.image {
			width: 50%;
		}

		.text {
			font-size: 24rpx;
			color: #999;
			margin-top: 30rpx;
		}
	}
</style>