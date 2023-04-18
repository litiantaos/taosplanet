<template>
	<view class="send-view" :style="{transform: `translateY(${-footerOffsetY}px)`}">
		<view class="main">
			<view v-if="tempImagePaths.length" class="images-wrap">
				<scroll-view-pro :list="tempImagePaths" v-slot="{item, index}">
					<view class="image-wrap">
						<image class="image" :src="item" mode="aspectFill" @click="previewImage(index)"></image>
						<view class="iconfont icon-close-circle-fill delete-btn" @click="removeImage(index)"></view>
					</view>
				</scroll-view-pro>
			</view>

			<view class="textarea-wrap" :style="{alignItems}">
				<textarea class="textarea" :style="{height: textareaHeight + 'px'}" v-model="inputValue" @focus="onFocus"
					@blur="onBlur" @input="onInput" @confirm="$event => beforeSend()" @linechange="linechange" :focus="focus"
					confirm-type="send" :show-confirm-bar="false" :adjust-position="false" :placeholder="placeholder">
				</textarea>
				<view class="btn-wrap" :style="{height: wrapHeight + 'px'}">
					<view v-if="!inputValue" class="emoji iconfont icon-emoji-happy"></view>
					<view v-if="!inputValue" class="media iconfont icon-gallery" @click="chooseMedia"></view>
					<view v-if="inputValue || tempImagePaths.length" class="send iconfont icon-arrow-circle-up-t-fill"
						@click="$event => beforeSend()">
					</view>
				</view>
			</view>
		</view>
		<safe-area type="bottom"></safe-area>
	</view>
</template>

<script>
	export default {
		name: "send-view",
		props: {
			placeholder: {
				type: String,
				default: ""
			},
			value: {
				type: String,
				default: ""
			},
			focus: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				textareaHeight: 0,
				wrapHeight: 0,
				alignItems: "center",
				footerOffsetY: 0,
				inputValue: this.value,
				tempImagePaths: []
			};
		},
		mounted() {},
		methods: {
			send(data) {
				if (Object.keys(data).length == 0) return;
				this.$emit("send", data);
			},
			beforeSend() {
				let data = {};

				if (this.inputValue) {
					data.value = this.inputValue;
				}

				if (this.tempImagePaths.length) {
					data.images = this.tempImagePaths;
				}

				this.send(data);
			},
			reset() {
				this.inputValue = "";
				this.tempImagePaths = [];
			},
			chooseMedia() {
				uni.chooseMedia({
					mediaType: ["image"],
					count: 2,
					success: res => {
						let tempFilePaths = res.tempFiles.map(item => {
							return item.tempFilePath
						});

						let arr = [...this.tempImagePaths, ...tempFilePaths];
						arr = arr.slice(0, 2);
						this.tempImagePaths = arr;
					}
				});
			},
			removeImage(index) {
				this.tempImagePaths.splice(index, 1);
			},
			previewImage(index) {
				uni.previewImage({
					current: index,
					urls: this.tempImagePaths
				});
			},

			onInput(e) {
				let {
					value
				} = e.detail;

				this.$emit("input", this.inputValue);
			},
			onFocus(e) {
				let {
					height
				} = e.detail;

				this.footerOffsetY = height;
				this.$emit("focus", height);
			},
			onBlur(e) {
				this.footerOffsetY = 0;
				this.$emit("blur", e);
			},
			linechange(e) {
				let {
					lineCount,
					height
				} = e.detail;

				if (this.wrapHeight == 0) {
					if (height < 24) {
						this.wrapHeight = 24;
					} else {
						this.wrapHeight = height;
					}
				}

				if (lineCount == 1) {
					this.alignItems = "center";
				} else {
					this.alignItems = "flex-end";
				}

				if (lineCount < 6) {
					this.textareaHeight = height;
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.send-view {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background: #fff;

		.main {
			width: 100%;
			padding: 25rpx;

			.images-wrap {
				margin-bottom: 25rpx;

				.image-wrap {
					position: relative;
				}

				.image {
					width: 150rpx;
					height: 150rpx;
					background: #eee;
					border: 1px solid #eee;
					border-radius: 15rpx;
					box-sizing: border-box;
					vertical-align: bottom;
				}

				.delete-btn {
					position: absolute;
					top: 10rpx;
					right: 10rpx;
					font-size: 36rpx;
					color: #fff;
					opacity: 0.6;
				}
			}

			.textarea-wrap {
				display: flex;
				justify-content: space-between;
				background: #f5f5f5;
				border-radius: 15rpx;
				padding: 5px 20rpx;

				.textarea {
					flex: 1;
					padding: 0;
					font-size: 14px;
					color: #333;
					line-height: 20px;
					text-align: justify;
					transition: height .2s;
				}

				.btn-wrap {
					display: flex;
					align-items: center;

					.iconfont {
						font-size: 24px;
						color: #666;
						margin-left: 20rpx;
					}

					.send {
						color: #333;
					}
				}
			}
		}
	}
</style>