<template>
	<view class="link" @click.stop="onClick">
		<view class="link-image iconfont icon-link"></view>
		<view class="wrap">
			<view class="link-url">
				<view class="url">{{isMiniApp ? miniAppName : tempData}}</view>
				<view v-if="showCopy && !copySuccess" class="iconfont icon-copy copy" @click.stop="copy"></view>
				<view v-if="showCopy && copySuccess" class="iconfont icon-copy-success copy-success"></view>
			</view>
			<view class="tip">
				{{isMiniApp ? '可直接跳转至AppID所对应的小程序' : '小程序不支持外链，请复制到浏览器打开'}}
			</view>
		</view>
		<view v-if="showRemove" class="iconfont icon-close-circle-fill delete-btn" @click.stop="handle">
		</view>
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
			},
			showCopy: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				tempData: this.data,
				copySuccess: false,
				isMiniApp: false,
				miniAppId: '',
				miniAppName: ''
			};
		},
		mounted() {
			if (this.tempData.startsWith("appid:")) {
				this.isMiniApp = true;
				const matches = this.tempData.match(/appid:(.*):(.*)/);
				this.miniAppId = matches[1];
				this.miniAppName = matches[2];
			}
		},
		watch: {
			data(newVal) {
				// console.log(newVal);
				this.tempData = newVal;
			}
		},
		methods: {
			copy() {
				uni.setClipboardData({
					data: this.tempData,
					showToast: false,
					success: () => {
						this.copySuccess = true;
						setTimeout(() => {
							this.copySuccess = false;
						}, 2000);
					}
				});
			},
			onClick() {
				if (this.isMiniApp) {
					uni.navigateToMiniProgram({
						appId: this.miniAppId
					});
				} else {
					uni.navigateTo({
						url: "/pages/webview/webview?url=" + this.tempData
					});
				}
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
		padding: 0 25rpx 0 15rpx;
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

		.wrap {
			margin-left: 20rpx;
		}

		.link-url {
			display: flex;
			align-items: center;

			.url {
				font-size: 30rpx;
				color: #333;
				word-break: break-all;
				display: -webkit-box;
				-webkit-line-clamp: 1;
				-webkit-box-orient: vertical;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.copy,
			.copy-success {
				margin-left: 20rpx;
			}

			.copy-success {
				color: #61c555;
			}
		}

		.tip {
			font-size: 24rpx;
			color: #999;
			margin-top: 10rpx;
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