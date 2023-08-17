<template>
	<view class="comment-wrap" :class="type == 0 ? 'comment': 'reply'">
		<view class="header">
			<view class="header-user">
				<cloud-file v-if="comment.user_id" :src="comment.user_id[0]" :width="type == 0 ? '80rpx': '45rpx'"
					:height="type == 0 ? '80rpx': '45rpx'" borderRadius="50%" border="1px solid #eee"></cloud-file>
				<view class="user-wrap" :class="type == 0 ? 'comment': 'reply'">
					<view class="user-name">
						<name-init v-if="comment.user_id" :data="comment.user_id[0]"></name-init>
						<view v-if="comment.user_id && comment.user_id[0]._id == postData.user_id" class="id-label">作者</view>
						<view v-if="comment.comment_type == 2" class="reply-to-user">
							<i class="iconfont icon-arrow-right-fill"></i>
							<name-init v-if="comment.user_id" :data="comment.reply_user_id[0]"></name-init>
							<view v-if="comment.reply_user_id && comment.reply_user_id[0]._id == postData.user_id" class="id-label">作者
							</view>
						</view>
					</view>
					<view v-if="type == 0" class="user-date">
						<uni-dateformat :date="comment.comment_date" format="M/d h:mm" :threshold="[60000, 3600000*24*30]">
						</uni-dateformat>
					</view>
				</view>
			</view>
			<view class="like">
				<like-handler :isLike="comment.isLike" :isClick="isClickLike" reverse isSmall :text="comment.like_count || ''"
					@click="clickLike"></like-handler>
			</view>
		</view>

		<view class="body" :class="type == 0 ? 'comment': 'reply'">
			<view class="content" @click="onComment">
				<view class="text">
					<text>{{comment.comment_content}}</text>
				</view>

				<view class="images">
					<scroll-view-pro v-if="comment.comment_images" :list="thumbnails" v-slot="{item, index}">
						<image class="image" :src="item" mode="aspectFill" lazy-load show-menu-by-longpress
							@click.stop="previewImage(index)"></image>
					</scroll-view-pro>
				</view>

				<view v-if="type != 0" class="user-date reply">
					<uni-dateformat :date="comment.comment_date" format="M/d h:mm" :threshold="[60000, 3600000*24*30]">
					</uni-dateformat>
				</view>
			</view>

			<slot :replies="replies"></slot>

			<view v-if="comment.replyCount > 5" class="reply-count" @click="$event => getReplies()">
				<text>共{{comment.replyCount}}条回复</text>
				<i v-if="!noMore" class="iconfont icon-arrow-right no-more"></i>
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
		checkCommentsLikes,
		getTempFileURL
	} from "@/common/cloud.js";

	const db = uniCloud.database();
	const utils = uniCloud.importObject("utils", {
		customUI: true
	});
	const pushMsg = uniCloud.importObject("push-msg", {
		customUI: true
	});

	export default {
		name: "comment",
		props: {
			type: {
				type: Number,
				default: 0
			},
			data: {
				type: Object,
				default: {}
			},
			postData: {
				type: Object,
				default: {}
			}
		},
		data() {
			return {
				comment: this.data,
				replies: [],
				isClickLike: false,
				fileUrls: [],
				thumbnails: [],
				noMore: false
			};
		},
		mounted() {
			if (this.type == 0) {
				this.getReplies();
			}

			if (this.comment.comment_images?.length) {
				this.setTempFileURL();
			}
		},
		methods: {
			deleteSend(index) {
				this.replies.splice(index, 1);
			},
			addSend(e, id, username) {
				let data = {
					_id: id,
					comment_date: Date.now(),
					user_id: [{
						avatar_file: {
							url: store.userInfo.avatar_file.url
						},
						nickname: store.userInfo.nickname,
						_id: store.userInfo._id
					}],
					like_count: 0,
					...e
				};

				data.reply_user_id = [{
					_id: e.reply_user_id,
					nickname: username
				}];

				this.replies.unshift(data);
			},
			previewImage(index) {
				uni.previewImage({
					current: index,
					urls: this.fileUrls
				});
			},
			async setTempFileURL() {
				this.fileUrls = await getTempFileURL(this.comment.comment_images);
				this.thumbnails = this.fileUrls.map(item => {
					return item + "?imageMogr2/thumbnail/240x"
				});
			},
			async handleLike() {
				let commentId = this.comment._id;

				// 查询是否点赞
				let count = await db.collection("db-posts-comments-likes")
					.where(`comment_id == "${commentId}" && user_id == $cloudEnv_uid`).count();

				// 增删点赞数据
				if (count.result.total) {
					await db.collection("db-posts-comments-likes").where(
							`comment_id == "${commentId}" && user_id == $cloudEnv_uid`)
						.remove();
					utils.calc("db-posts-comments", "like_count", commentId, -1);
				} else {
					await db.collection("db-posts-comments-likes").add({
						post_id: this.postData.post_id,
						comment_id: commentId,
					});
					utils.calc("db-posts-comments", "like_count", commentId, 1);

					let pushParam = {
						type: "comment-like",
						content: "赞了你的评论",
						post_id: this.postData.post_id,
						comment_id: this.comment._id,
						user_id: this.comment.user_id[0]._id,
						excerpt: this.comment.comment_content.substr(0, 25),
						from_user_id: store.userInfo._id,
						from_user_name: store.userInfo.nickname,
						from_user_avatar: store.userInfo.avatar_file.url,
						date: Date.now()
					};

					await utils.addData("db-messages", pushParam).then(res => {
						pushParam._id = res.id;
					});

					pushMsg.sendMsg({
						user_id: this.comment.user_id[0]._id,
						payload: pushParam
					});
				}
			},
			clickLike: throttle(function() {
				if (!store.hasLogin) {
					this.$emit("likeLogin");
					return;
				}

				// 本地切换点赞状态
				uni.vibrateShort({
					success: () => {
						this.comment.isLike ? this.comment.like_count-- : this.comment.like_count++;
						this.comment.isLike = !this.comment.isLike;
						this.isClickLike = true;
						setTimeout(() => {
							this.isClickLike = false;
						}, 500);
					}
				});

				this.handleLike();
			}),

			// 获取回复列表
			async getReplies() {
				let tempComments = await db.collection("db-posts-comments").where(
					`post_id == "${this.comment.post_id}" && (comment_type == 1 || comment_type == 2) && reply_comment_id == "${this.comment._id}"`
				).orderBy("comment_date desc").skip(this.replies.length).limit(5).getTemp();
				let tempUsers = await db.collection("uni-id-users").field("_id, avatar_file, nickname").getTemp();

				let res = await db.collection(tempComments, tempUsers).get();

				let newData = res.result.data;

				if (newData.length < 5) {
					this.noMore = true;
				}

				if (store.hasLogin) {
					await checkCommentsLikes(newData).then(result => {
						newData = result;
					});
				}

				let resData = [...this.replies, ...newData];

				this.replies = resData;
			},
			onComment() {
				this.$emit("onComment");
			}
		}
	}
</script>

<style lang="scss" scoped>
	.comment-wrap {

		&.comment {
			margin-bottom: 30rpx;
		}

		&.reply {
			margin-bottom: 20rpx;
		}

		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;

			.header-user {
				display: flex;
				justify-content: flex-start;
				align-items: center;

				.user-wrap {
					display: flex;
					flex-direction: column;
					justify-content: space-around;

					&.comment {
						margin-left: 20rpx;
					}

					&.reply {
						margin-left: 10rpx;
					}

					.user-name {
						display: flex;
						align-items: center;
						font-size: 28rpx;

						.reply-to-user {
							display: flex;
							align-items: center;

							.iconfont {
								font-size: 28rpx;
								color: #aaa;
								margin: 0 10rpx;
							}
						}

						.id-label {
							background: #eee;
							border-radius: 8rpx;
							padding: 2rpx 10rpx;
							font-size: 18rpx;
							color: #666;
							display: flex;
							align-items: center;
							margin-left: 15rpx;
						}
					}
				}
			}
		}

		.body {

			&.comment {
				margin-left: 100rpx;
			}

			&.reply {
				margin-left: 50rpx;
			}

			.content {
				margin-bottom: 30rpx;

				.text {
					font-size: 28rpx;
					color: #333;
					margin-top: 15rpx;
				}

				.images {
					margin-top: 15rpx;

					.image {
						width: 150rpx;
						height: 150rpx;
						background: #eee;
						border-radius: 15rpx;
						vertical-align: bottom;
					}
				}
			}

			.reply-count {
				width: fit-content;
				font-size: 24rpx;
				color: #666;
				padding: 0 20rpx;
				height: 50rpx;
				background: #eee;
				border-radius: 10rpx;
				display: flex;
				justify-content: center;
				align-items: center;

				.no-more {
					font-size: 26rpx;
					font-weight: bold;
					color: #999;
					margin-left: 15rpx;
					line-height: 100%;
				}
			}
		}

		.user-date {
			font-size: 24rpx;
			color: #999;

			&.reply {
				margin-top: 15rpx;
			}
		}
	}
</style>