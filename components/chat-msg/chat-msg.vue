<template>
	<view class="msg-item" :class="{'reverse': isSelf}">
		<view class="msg-avatar" @click="toUserDetail">
			<cloud-file :src="avatarUrl" width="100%" height="100%" borderRadius="50%"></cloud-file>
		</view>
		<view class="wrap" :class="{'reverse': isSelf}">
			<view class="msg-name">
				<name-init :data="data.from_uid[0].nickname"></name-init>
			</view>
			<text v-if="data.text" class="msg-text" :class="{'reverse': isSelf}">
				{{data.text}}
			</text>
			<swiper v-if="data.images" class="msg-swiper" :class="{'mt': data.text}" :indicator-dots="data.images.length > 1">
				<swiper-item class="swiper-item" v-for="(item, index) in thumbnails" :key="index">
					<image class="image" :src="item" mode="aspectFill" show-menu-by-longpress @click="previewImage(index)">
					</image>
				</swiper-item>
			</swiper>
			<view class="msg-time">
				<uni-dateformat :date="data.create_time" format="M/d h:mm" :threshold="[60000, 3600000*24]">
				</uni-dateformat>
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
			}
		},
		data() {
			return {
				fileUrls: [],
				thumbnails: []
			};
		},
		mounted() {
			this.setTempFileURL();
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
			async setTempFileURL() {
				if (this.data.images) {
					this.fileUrls = await getTempFileURL(this.data.images);
					this.thumbnails = this.fileUrls.map(item => {
						return item + "?imageMogr2/thumbnail/540x"
					});
				}
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
	.msg-item {
		display: flex;
		margin-bottom: 50rpx;

		&.reverse {
			flex-direction: row-reverse;
		}

		.msg-avatar {
			width: 70rpx;
			height: 70rpx;
		}

		.wrap {
			margin: 0 20rpx;
			display: flex;
			flex-direction: column;
			align-items: flex-start;

			&.reverse {
				align-items: flex-end;
			}

			.msg-name {
				font-size: 22rpx;
				color: #999;
				height: 40rpx;
			}

			.msg-text {
				display: flex;
				align-items: center;
				width: fit-content;
				max-width: 500rpx;
				padding: 15rpx 25rpx;
				background: #fff;
				border-radius: 15rpx;
				font-size: 28rpx;
				color: #333;
				line-height: 40rpx;
				text-align: justify;
				word-break: break-all;

				&.reverse {
					background: #0396ff;
					color: #fff;
				}
			}

			.msg-swiper {
				width: 320rpx;
				height: 320rpx;
				background: #eee;
				border-radius: 15rpx;
				overflow: hidden;

				&.mt {
					margin-top: 20rpx;
				}

				.swiper-item {
					width: 100%;
					height: 100%;

					.image {
						width: 100%;
						height: 100%;
					}
				}
			}

			.msg-time {
				height: 28rpx;
				padding: 0 10rpx;
				background: #eee;
				border-radius: 6rpx;
				font-size: 16rpx;
				color: #aaa;
				margin-top: 15rpx;
				display: flex;
				align-items: center;
			}
		}
	}
</style>