<template>
	<nav-bar></nav-bar>
	<safe-area></safe-area>

	<view class="container">
		<view class="title">欢迎登录</view>
		<view class="desc">通过微信授权可直接进行登录</view>

		<view class="wrap">
			<image class="image" src="../../static/images/tree.svg" mode="widthFix"></image>
			<view class="text">生命与理想不可辜负</view>
			<view class="button" @click="login">微信授权登录</view>
		</view>
	</view>

	<toast ref="toast"></toast>
</template>

<script>
	import {
		store,
		mutations
	} from "@/uni_modules/uni-id-pages/common/store.js";

	const uniIdCo = uniCloud.importObject("uni-id-co", {
		customUI: true
	});

	export default {
		data() {
			return {};
		},
		methods: {
			getTempRegion() {
				let sto = uni.getStorageSync("temp-region");

				if (sto && !store.userInfo.region.longitude) {
					mutations.updateUserInfo({
						region: sto
					});

					setTimeout(() => {
						uni.removeStorageSync("temp-region");
					}, 200);
				}
			},
			login() {
				this.$refs.toast.show({
					type: "loading",
					text: "登录中",
					duration: "none"
				});

				uni.login({
					provider: "weixin",
					success: res => {
						let data = {
							code: res.code
						};

						uniIdCo["loginByWeixin"](data).then(result => {
							// console.log(result);

							mutations.loginSuccess({
								autoBack: true
							});

							this.$refs.toast.show({
								type: "success",
								text: "登录成功",
								duration: "2000"
							});

							this.getTempRegion();
						}).catch(err => {
							console.log(err);
						})
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		padding: 0 40rpx;

		.title {
			height: 80rpx;
			display: flex;
			align-items: center;
			font-size: 45rpx;
			font-weight: bold;
			margin-bottom: 10rpx;
		}

		.desc {
			font-size: 24rpx;
			color: #999;
		}

		.wrap {
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;

			.image {
				width: 70%;
				margin-top: 250rpx;
			}

			.text {
				font-size: 24rpx;
				color: #999;
				margin-top: 25rpx;
			}

			.button {
				width: 100%;
				height: 90rpx;
				background: #2aae67;
				border-radius: 15rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				color: #fff;
				font-size: 28rpx;
				margin-top: 120rpx;
				transition: opacity .2s;

				&:active {
					opacity: 0.8;
				}
			}
		}
	}
</style>