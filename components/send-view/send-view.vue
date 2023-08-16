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

			<view v-if="tempVideoPaths.length" class="videos-wrap">
				<scroll-view-pro :list="tempVideoPaths" v-slot="{item, index}">
					<view class="video-wrap">
						<video class="video" :src="item" object-fit="cover"></video>
						<view class="iconfont icon-close-circle-fill delete-btn" @click="removeVideo(index)"></view>
					</view>
				</scroll-view-pro>
			</view>

			<view v-if="tempReplyMsg.from_uid" class="reply-msg">
				<view class="reply-msg-content">
					<view class="reply-name">{{tempReplyMsg.from_uid[0].nickname}}</view>
					<view v-if="tempReplyMsg.text" class="reply-text">{{tempReplyMsg.text}}</view>
					<view v-else-if="tempReplyMsg.images" class="reply-text">[图片]</view>
					<view v-else-if="tempReplyMsg.videos" class="reply-text">[视频]</view>
				</view>

				<view class="iconfont icon-close-circle-fill" @click="removeReply"></view>
			</view>

			<view class="textarea-wrap" :style="{alignItems}">
				<textarea class="textarea" :style="{height: textareaHeight + 'px'}" v-model="inputValue" @focus="onFocus"
					@blur="onBlur" @input="onInput" @confirm="$event => beforeSend()" @linechange="linechange" :focus="focus"
					confirm-type="send" :show-confirm-bar="false" :adjust-position="false" :placeholder="placeholder">
				</textarea>
				<view class="btn-wrap" :style="{height: wrapHeight + 'px'}">
					<!-- <view class="emoji iconfont icon-emoji-happy"></view> -->
					<view class="media iconfont icon-gallery" @click="chooseMedia"></view>
					<view v-if="inputValue || tempImagePaths.length || tempVideoPaths.length"
						class="send iconfont icon-arrow-circle-up-t-fill" @click="$event => beforeSend()">
					</view>
				</view>
			</view>
		</view>
		<safe-area type="bottom"></safe-area>
	</view>
</template>

<script>
	import {
		throttle
	} from "@/common/utils.js";

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
			},
			mediaType: {
				type: Array,
				default: ["image", "video"]
			},
			mediaCount: {
				type: Number,
				default: 9
			},
			replyMsg: {
				type: Object,
				default: {}
			}
		},
		data() {
			return {
				textareaHeight: 0,
				wrapHeight: 0,
				alignItems: "center",
				footerOffsetY: 0,
				safeBottom: 0,
				inputValue: this.value,
				tempImagePaths: [],
				tempVideoPaths: [],
				tempReplyMsg: {}
			};
		},
		mounted() {
			let {
				safeAreaInsets
			} = getApp().globalData.systemInfo;

			this.safeBottom = safeAreaInsets.bottom;

			setTimeout(() => {
				this.getHeight();
			}, 200);
		},
		watch: {
			tempImagePaths(newVal) {
				setTimeout(() => {
					this.getHeight();
				}, 200);
			},
			tempVideoPaths(newVal) {
				setTimeout(() => {
					this.getHeight();
				}, 200);
			},
			replyMsg(newVal) {
				this.tempReplyMsg = newVal;
			}
		},
		methods: {
			removeReply() {
				this.tempReplyMsg = {};
				this.footerOffsetY = 0;
			},
			getHeight() {
				const query = uni.createSelectorQuery().in(this);
				query.selectAll(".send-view").boundingClientRect(data => {
					// console.log(data[0]);
					this.$emit("height", data[0].height);
				}).exec();
			},
			send(data) {
				if (Object.keys(data).length == 0) return;
				this.$emit("send", data);
			},
			beforeSend: throttle(function() {
				let data = {};

				if (this.inputValue) {
					data.value = this.inputValue;
				}

				if (this.tempImagePaths.length) {
					data.images = this.tempImagePaths;
				}

				if (this.tempVideoPaths.length) {
					data.videos = this.tempVideoPaths;
				}

				if (this.tempReplyMsg) {
					data.reply_to_id = this.tempReplyMsg._id;
				}

				this.send(data);
			}),
			reset() {
				this.inputValue = "";
				this.tempImagePaths = [];
				this.tempVideoPaths = [];
				this.tempReplyMsg = {};
				this.footerOffsetY = 0;
			},
			chooseMedia() {
				uni.chooseMedia({
					mediaType: this.mediaType,
					count: this.mediaCount,
					success: res => {
						console.log(res);
						let tempFilePaths = res.tempFiles.map(item => {
							return item.tempFilePath
						});

						let filePaths;

						if (res.type == "image") {
							filePaths = this.tempImagePaths;
						} else if (res.type == "video") {
							filePaths = this.tempVideoPaths;
						}

						let arr = [...filePaths, ...tempFilePaths];
						arr = arr.slice(0, this.mediaCount);

						if (res.type == "image") {
							this.tempImagePaths = arr;
						} else if (res.type == "video") {
							this.tempVideoPaths = arr;
						}
					}
				});
			},
			removeImage(index) {
				this.tempImagePaths.splice(index, 1);

				// 监听数组为空
				if (!this.tempImagePaths.length) {
					this.tempImagePaths = [];
				}
			},
			removeVideo(index) {
				this.tempVideoPaths.splice(index, 1);

				// 监听数组为空
				if (!this.tempVideoPaths.length) {
					this.tempVideoPaths = [];
				}
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

				this.footerOffsetY = height - this.safeBottom;
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
		transition: transform .3s;

		.main {
			width: 100%;
			padding: 25rpx;

			.reply-msg {
				margin-bottom: 25rpx;
				display: flex;
				justify-content: space-between;
				align-items: center;

				.reply-msg-content {
					flex: 1;
					display: flex;
					align-items: center;

					.reply-name {
						white-space: nowrap;
						line-height: 40rpx;
						background: #eee;
						border-radius: 8rpx;
						margin-right: 20rpx;
						font-size: 24rpx;
						font-weight: bold;
						color: #666;
						padding: 0 15rpx;
					}

					.reply-text {
						font-size: 28rpx;
						color: #666;
						word-break: break-all;
						display: -webkit-box;
						-webkit-line-clamp: 1;
						-webkit-box-orient: vertical;
						overflow: hidden;
						text-overflow: ellipsis;
					}
				}

				.iconfont {
					font-size: 34rpx;
					color: #aaa;
					margin-left: 20rpx;
				}
			}

			.image-wrap,
			.video-wrap {
				position: relative;
				margin-bottom: 25rpx;
			}

			.image,
			.video {
				background: #eee;
				border-radius: 15rpx;
				vertical-align: bottom;
			}

			.image {
				width: 150rpx;
				height: 150rpx;
			}

			.video {
				width: 320rpx;
				height: 180rpx;
			}

			.delete-btn {
				position: absolute;
				top: 10rpx;
				right: 10rpx;
				font-size: 36rpx;
				color: #fff;
				opacity: 0.6;
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