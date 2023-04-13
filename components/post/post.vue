<template>
	<view class="post" :class="isCard ? 'card' : 'no-card'" @click="toPostDetail">
		<view class="header">
			<view class="header-user" @click.stop="toUserDetail">
				<cloud-file class="user-avatar" :src="post.user_id[0]" width="80rpx" height="80rpx" borderRadius="50%"
					border="1px solid #eee"></cloud-file>
				<view class="user-info">
					<view class="user-info_name">
						<name-init :data="post.user_id[0]"></name-init>
					</view>
					<view class="user-info_intro">{{post.user_id[0].intro}}</view>
				</view>
			</view>
			<view v-if="post.topic_id.length" class="header-topic">{{post.topic_id[0].name}}</view>
		</view>

		<view class="body">
			<view class="body-content" :class="{'collapse': isCollapse}">
				<text class="content-text" user-select>{{post.content}}</text>
				<view v-if="isOverflow && isCollapse" class="content-more">···</view>
			</view>

			<scroll-view-pro v-if="post.images && !isSimple" :list="fileUrls" v-slot="{item, index}">
				<image class="body-image" :src="item" mode="aspectFill" lazy-load show-menu-by-longpress
					@click.stop="previewImage(index)"></image>
			</scroll-view-pro>

			<scroll-view-pro v-if="post.videos && !isSimple" :list="fileUrls" v-slot="{item, index}">
				<video class="body-video" :src="item" :controls="false" :show-progress="false" :show-fullscreen-btn="false"
					:show-play-btn="false" :show-center-play-btn="false" :enable-progress-gesture="false"
					:mobilenet-hint-type="0">
					<view class="video-mask iconfont icon-play-circle-fill" @click.stop="previewVideo(item, index)">
					</view>
				</video>
			</scroll-view-pro>

			<view v-if="post.location && !isSimple" class="body-location">
				<i class="iconfont icon-location-fill"></i>
				<view class="location-text">{{post.location_name}}</view>
			</view>

			<view v-if="post.shared_post_id" class="shared-post" @click.stop="toPostDetail({isShare: true})">
				<cloud-file v-if="sharedPost.images || sharedPost.user_id" :src="fileUrls[0] || sharedPost.user_id[0]"
					width="130rpx" height="130rpx"></cloud-file>
				<view class="shared-post_content">
					<view class="shared-post_content-text">
						<text class="text">{{sharedPost.content}}</text>
					</view>
					<view v-if="sharedPost.topic_id?.length" class="shared-post_content-topic">{{sharedPost.topic_id[0].name}}
					</view>
				</view>
			</view>

			<link-card v-if="post.link" :data="post.link"></link-card>

			<view v-if="post.is_modified" class="body-modified">已编辑</view>
		</view>

		<view v-if="!isSimple" class="footer">
			<view class="footer-item">
				<i class="iconfont icon-like like" :class="{'active': post.isLike, 'animation': isClickLike}"
					@click.stop="clickLike"></i>
				<view class="text">{{post.like_count || ""}}</view>
			</view>
			<view class="footer-item">
				<i class="iconfont icon-message"></i>
				<view class="text">{{post.comment_count || ""}}</view>
			</view>
			<view class="footer-item">
				<i class="iconfont icon-send-t" @click.stop="clickShare"></i>
			</view>
			<view class="footer-item" v-if="showMore && isCurrentUser">
				<i class="iconfont icon-more-circle" @click.stop="clickMore"></i>
			</view>
			<view class="footer-item">
				<view class="text">
					<uni-dateformat :date="post.publish_date" format="M/d h:mm" :threshold="[60000, 3600000*24*30]">
					</uni-dateformat>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

	import {
		throttle
	} from "@/common/utils.js";

	import {
		getTempFileURL
	} from "@/common/cloud.js";

	const db = uniCloud.database();
	const utils = uniCloud.importObject("utils", {
		customUI: true
	});

	export default {
		name: "post",
		props: {
			data: {
				type: Object,
				default: {}
			},
			postId: {
				type: String,
				default: ""
			},
			isCard: {
				type: Boolean,
				default: true
			},
			isClick: {
				type: Boolean,
				default: true
			},
			showMore: {
				type: Boolean,
				default: false
			},
			isCurrentUser: {
				type: Boolean,
				default: false
			},
			isCollapse: {
				type: Boolean,
				default: true
			},
			isSimple: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				screenWidth: 0,
				post: this.data,
				isOverflow: false,
				fileUrls: [],
				sharedPost: {},
				isClickLike: false
			};
		},
		mounted() {
			let {
				screenWidth
			} = getApp().globalData.systemInfo;

			this.screenWidth = screenWidth;

			this.getContentHeight();

			this.setTempFileURL();

			if (this.post.shared_post_id) {
				this.getsharedPost();
			}
		},
		methods: {
			clickMore() {
				this.$emit("more");
			},
			clickShare() {
				uni.setStorageSync("post-share", this.post);
				this.$emit("share");
			},
			async handleLike() {
				let postId = this.postId;

				// 查询是否点赞
				let count = await db.collection("db-posts-likes")
					.where(`post_id == "${postId}" && user_id == $cloudEnv_uid`).count();

				// 增删点赞数据
				if (count.result.total) {
					await db.collection("db-posts-likes").where(`post_id == "${postId}" && user_id == $cloudEnv_uid`)
						.remove();
					utils.calc("db-posts", "like_count", postId, -1);
				} else {
					await db.collection("db-posts-likes").add({
						post_id: postId,
					});
					utils.calc("db-posts", "like_count", postId, 1);

					uniCloud.callFunction({
						name: "push",
						data: {
							user_id: this.post.user_id[0]._id,
							payload: {
								type: "like",
								content: "赞了你的动态",
								post_id: this.postId,
								user_id: this.post.user_id[0]._id,
								excerpt: this.post.content.substr(0, 15),
								from_user_id: store.userInfo._id,
								from_user_name: store.userInfo.nickname,
								from_user_avatar: store.userInfo.avatar_file.url,
								date: Date.now()
							}
						}
					});
				}
			},
			clickLike: throttle(function() {
				if (!store.hasLogin) {
					this.$emit("like");
					return;
				}

				// 本地切换点赞状态
				uni.vibrateShort({
					success: () => {
						this.post.isLike ? this.post.like_count-- : this.post.like_count++;
						this.post.isLike = !this.post.isLike;
						this.isClickLike = true;
						setTimeout(() => {
							this.isClickLike = false;
						}, 500);
					}
				});

				this.handleLike();
			}),
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
					url: "/pages-user/user-detail/user-detail?id=" + this.post.user_id[0]._id
				});
			},
			toPostDetail({
				isShare
			}) {
				if (this.isClick && !isShare) {
					uni.navigateTo({
						url: "/pages-post/post-detail/post-detail?id=" + this.postId
					});
				} else if (isShare) {
					uni.navigateTo({
						url: "/pages-post/post-detail/post-detail?id=" + this.sharedPost._id
					});
				}
			},
			getsharedPost() {
				let tempsharedPost = db.collection("db-posts").where(`_id == "${this.post.shared_post_id}"`).field(
					"_id, user_id, content, topic_id, images").getTemp();
				let tempTopic = db.collection("db-topics").field("_id, name").getTemp();
				let tempUser = db.collection("uni-id-users").field("_id, avatar_file").getTemp();

				db.collection(tempsharedPost, tempTopic, tempUser).get().then(res => {
					// console.log(res);
					this.sharedPost = res.result.data[0];
				});
			},
			async setTempFileURL() {
				if (this.post.images) {
					this.fileUrls = await getTempFileURL(this.post.images);
				} else if (this.post.videos) {
					this.fileUrls = await getTempFileURL(this.post.videos);
				}
			},
			getContentHeight() {
				const query = uni.createSelectorQuery().in(this);

				query.select(".body-content").boundingClientRect(data => {
					let wh = 250 * (this.screenWidth / 750);

					if (data.height > wh) {
						this.isOverflow = true;
					} else {
						this.isOverflow = false;
					}
				}).exec();
			},
		}
	}
</script>

<style lang="scss" scoped>
	.post {
		background: #fff;

		&.card {
			padding: $uni-spacing-base;
			margin-bottom: $uni-spacing-base;
			border-radius: $uni-border-radius-lg;
		}

		&.no-card {
			padding: $uni-spacing-xl $uni-spacing-base;
		}

		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;

			.header-user {
				display: flex;
				justify-content: flex-start;
				align-items: center;

				.user-info {
					display: flex;
					flex-direction: column;
					justify-content: space-around;
					width: 350rpx;
					margin: 0 20rpx;

					&_name {
						font-size: $uni-font-size-base;
						font-weight: bold;
					}

					&_intro {
						font-size: $uni-font-size-sm;
						color: $uni-text-color-grey-l;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}
				}
			}

			.header-topic {
				display: flex;
				justify-content: flex-end;
				align-items: center;
				padding: $uni-spacing-sm;
				background: $uni-bg-color-grey;
				border-radius: $uni-border-radius-sm;
				font-size: $uni-font-size-xs;
			}
		}

		.body {
			.body-content {
				margin: 20rpx 0;

				&.collapse {
					max-height: 250rpx;
					overflow: hidden;
				}

				.content-text {
					display: block;
					font-size: 30rpx;
					line-height: 50rpx;
					color: $uni-text-color;
					text-align: justify;
				}

				.content-more {
					display: flex;
					justify-content: center;
					align-items: center;
					width: 80rpx;
					height: 40rpx;
					background: $uni-bg-color-grey;
					border-radius: $uni-border-radius-sm;
					margin-top: -10rpx;
					font-size: $uni-font-size-sm;
					color: $uni-text-color-grey-m;
				}
			}

			.body-image {
				width: 240rpx;
				height: 240rpx;
				background: $uni-bg-color-grey;
				border-radius: 15rpx;
				vertical-align: bottom;
			}

			.body-video {
				position: relative;
				width: 480rpx;
				height: 270rpx;
				background: $uni-bg-color-grey;
				border-radius: 15rpx;
				vertical-align: bottom;

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
					border-radius: $uni-border-radius-base;
					font-size: 80rpx;
					color: rgba(255, 255, 255, 0.8);
				}
			}

			.body-location {
				display: flex;
				align-items: center;
				margin: 20rpx 0;

				.iconfont {
					font-size: 30rpx;
					color: $uni-text-color-grey-m;
				}

				.location-text {
					margin-left: 10rpx;
					font-size: 24rpx;
					color: $uni-text-color-grey-m;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}

			.shared-post {
				display: flex;
				align-items: center;
				width: 100%;
				height: 170rpx;
				padding: 20rpx;
				background: $uni-bg-color-grey;
				border-radius: $uni-border-radius-base;

				&_content {
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					flex: 1;
					height: 100%;
					margin-left: 20rpx;

					&-text {
						display: flex;
						align-items: center;
						height: 100%;

						.text {
							display: -webkit-box;
							-webkit-line-clamp: 2;
							-webkit-box-orient: vertical;
							font-size: 24rpx;
							line-height: 40rpx;
							color: $uni-text-color;
							overflow: hidden;
							text-overflow: ellipsis;
						}
					}

					&-topic {
						padding-top: 10rpx;
						font-size: 20rpx;
						color: $uni-text-color;
						text-align: end;
						border-top: 1px solid $uni-border-color;
					}
				}
			}

			.body-modified {
				font-size: $uni-font-size-sm;
				color: $uni-text-color-grey-l;
				margin-top: 15rpx;
			}
		}

		.footer {
			display: flex;
			margin-top: 30rpx;

			.footer-item {
				display: flex;
				align-items: center;

				&:not(:nth-last-child(2)) {
					flex: 2;
				}

				&:nth-last-child(2) {
					flex: 1;
				}

				&:last-child {
					justify-content: flex-end;
				}

				.iconfont {
					font-size: 36rpx;
				}

				.like {
					&.active {
						color: $uni-color-primary;
					}

					&.animation {
						animation: likeActive .5s;

						@keyframes likeActive {
							0% {
								transform: scale(1);
							}

							60% {
								transform: scale(1.2);
							}

							100% {
								transform: scale(1);
							}
						}
					}
				}

				.text {
					font-size: $uni-font-size-sm;
					color: $uni-text-color-grey-m;
					margin-left: 20rpx;
				}
			}
		}
	}
</style>