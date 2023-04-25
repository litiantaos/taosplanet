<template>
	<view class="msg-item" :class="{'reverse': isSelf}">
		<view class="msg-avatar" @click="toUserDetail">
			<cloud-file :src="avatarUrl" width="100%" height="100%" borderRadius="50%"></cloud-file>
		</view>
		<view class="wrap" :class="{'reverse': isSelf}">
			<view class="wrap-main" :class="{'reverse': isSelf}">
				<view class="msg-header" :class="{'reverse': isSelf}">
					<name-init class="msg-name" :data="data.from_uid[0].nickname"></name-init>
					<uni-dateformat class="msg-time" :date="data.create_time" format="M月d日 h:mm"
						:threshold="[60000, 3600000*24*3]">
					</uni-dateformat>
				</view>

				<text v-if="data.text" class="msg-text" :class="{'reverse': isSelf}" user-select>
					{{data.text}}
				</text>

				<view v-if="data.reply_to_id" class="reply-msg">
					<view v-if="replyMsg.from_uid">{{replyMsg.from_uid[0].nickname}}：</view>
					<view v-if="replyMsg.text" class="reply-msg-text">{{replyMsg.text}}</view>
					<view v-else-if="replyMsg.images" class="reply-msg-text">[图片]</view>
					<view v-else-if="replyMsg.videos" class="reply-msg-text">[视频]</view>
				</view>

				<swiper v-if="data.images" class="msg-images" :class="{'mt': data.text}"
					:indicator-dots="data.images.length > 1">
					<swiper-item class="image-wrap" v-for="(item, index) in thumbnails" :key="index">
						<image class="image" :src="item" mode="aspectFill" @click="previewImage(index)">
						</image>
					</swiper-item>
				</swiper>
				<swiper v-if="data.videos" class="msg-videos" :class="{'mt': data.text}"
					:indicator-dots="data.videos.length > 1">
					<swiper-item class="video-wrap" v-for="(item, index) in fileUrls" :key="index">
						<video class="video" :src="item" :controls="false" :show-progress="false" :show-fullscreen-btn="false"
							:show-play-btn="false" :show-center-play-btn="false" :enable-progress-gesture="false"
							:mobilenet-hint-type="0" object-fit="cover" :vslide-gesture-in-fullscreen="false">
							<view class="video-mask iconfont icon-play-circle-fill" @click.stop="previewVideo(item, index)"></view>
						</video>
					</swiper-item>
				</swiper>
			</view>

			<view v-if="showFun" class="wrap-fun">
				<view class="fun-btn iconfont icon-share-arrow" @click="onReply"></view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		store as uniIdStore
	} from "@/uni_modules/uni-id-pages/common/store.js";

	import {
		getTempFileURL
	} from "@/common/cloud.js";

	const db = uniCloud.database();

	export default {
		name: "chat-msg-item",
		props: {
			isSelf: {
				type: Boolean,
				default: false
			},
			data: {
				type: Object,
				default: {}
			},
			showFun: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				fileUrls: [],
				thumbnails: [],
				replyMsg: {}
			};
		},
		mounted() {
			this.setTempFileURL();

			if (this.data.reply_to_id) {
				this.getReplyMsg();
			}
		},
		computed: {
			avatarUrl() {
				if (this.isSelf) {
					return uniIdStore.userInfo.avatar_file?.url;
				} else {
					return this.data.from_uid[0].avatar_file?.url;
				}
			}
		},
		methods: {
			async getReplyMsg() {
				let tempMsg = await db.collection("db-chat-msg").where(`_id == "${this.data.reply_to_id}"`).getTemp();
				let tempUser = await db.collection("uni-id-users").field("_id, nickname").getTemp();

				db.collection(tempMsg, tempUser).get().then(res => {
					this.replyMsg = res.result.data[0];
				});
			},
			onReply() {
				this.$emit("reply");
			},
			async setTempFileURL() {
				if (this.data.images) {
					this.fileUrls = await getTempFileURL(this.data.images);
					this.thumbnails = this.fileUrls.map(item => {
						return item + "?imageMogr2/thumbnail/540x"
					});
				} else if (this.data.videos) {
					this.fileUrls = await getTempFileURL(this.data.videos);
				}
			},
			previewVideo(item, index) {
				// console.log(e);
				uni.navigateTo({
					url: "/pages/video/video?index=" + index + "&url=" + item
				});
			},
			previewImage(index) {
				uni.previewImage({
					current: index,
					urls: this.fileUrls
				});
			},
			toUserDetail() {
				uni.navigateTo({
					url: "/pages-user/user-detail/user-detail?id=" + this.data.from_uid[0]._id
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
	.reverse {
		flex-direction: row-reverse;
	}

	.msg-item {
		display: flex;

		.msg-avatar {
			width: 75rpx;
			height: 75rpx;
		}

		.wrap {
			margin: 0 20rpx;
			display: flex;

			.wrap-main {
				display: flex;
				flex-direction: column;
				align-items: flex-start;

				&.reverse {
					align-items: flex-end;
				}

				.msg-header {
					line-height: 40rpx;
					display: flex;
					align-items: center;
					margin-bottom: 10rpx;
					font-size: 24rpx;

					.msg-name {
						font-weight: bold;
						color: #666;
					}

					.msg-time {
						color: #999;
						margin: 0 20rpx;
					}
				}

				.reply-msg {
					width: fit-content;
					line-height: 60rpx;
					background: #e5e5e5;
					border-radius: 10rpx;
					font-size: 28rpx;
					color: #999;
					display: flex;
					padding: 0 20rpx;
					margin-top: 20rpx;

					.reply-msg-text {
						max-width: 400rpx;
						word-break: break-all;
						display: -webkit-box;
						-webkit-line-clamp: 1;
						-webkit-box-orient: vertical;
						overflow: hidden;
						text-overflow: ellipsis;
					}
				}

				.msg-text {
					display: flex;
					align-items: center;
					width: fit-content;
					max-width: 500rpx;
					padding: 20rpx 25rpx;
					background: #fff;
					border-radius: 15rpx;
					font-size: 32rpx;
					color: #333;
					line-height: 40rpx;
					text-align: justify;
					word-break: break-all;

					&.reverse {
						background: #0396ff;
						color: #fff;
					}
				}

				.msg-images,
				.msg-videos {
					width: 320rpx;
					height: 320rpx;
					background: #eee;
					border-radius: 15rpx;
					overflow: hidden;
					// transform: translateY(0);

					&.mt {
						margin-top: 20rpx;
					}

					.image-wrap,
					.video-wrap {
						width: 100%;
						height: 100%;

						.image,
						.video {
							width: 100%;
							height: 100%;
						}

						.video {
							position: relative;

							.video-mask {
								position: absolute;
								top: 0;
								left: 0;
								display: flex;
								justify-content: center;
								align-items: center;
								width: 100%;
								height: 100%;
								background: rgba(0, 0, 0, 0.1);
								border-radius: 15rpx;
								font-size: 80rpx;
								color: rgba(255, 255, 255, 0.8);
							}
						}
					}
				}
			}

			.wrap-fun {
				padding: 50rpx 30rpx 0;
				display: flex;

				.fun-btn {
					width: 70rpx;
					height: 70rpx;
					background: #eee;
					border-radius: 50%;
					display: flex;
					justify-content: center;
					align-items: center;
					font-size: 30rpx;
					color: #666;
				}
			}
		}
	}
</style>