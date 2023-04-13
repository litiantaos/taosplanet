<template>
	<view>
		<nav-bar></nav-bar>
		<safe-area></safe-area>

		<view class="container">
			<input-pro :inputIn="inputIn" @input="onInput"></input-pro>
			<view class="button" @click="onClick">{{confirmType}}</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "edit-view",
		props: {
			inputIn: {
				type: Object,
				default: {}
			},
			confirmType: {
				type: String,
				default: "完成"
			}
		},
		data() {
			return {

			};
		},
		methods: {
			onInput(e) {
				this.$emit("input", e);
			},
			onClick() {
				this.$emit("confirm");
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		margin: 25rpx;

		.button {
			height: 100rpx;
			background: #333;
			border-radius: 20rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			color: #fff;
			font-size: 28rpx;
			margin: 80rpx 0;
			transition: opacity .2s;

			&:active {
				opacity: 0.8;
			}
		}
	}
</style>