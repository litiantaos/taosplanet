<template>
	<view class="comment">
		<view class="header">
			<view class="user-wrap">
				<cloud-file :src="setAvatar(comment.user_id[0])" width="80rpx" height="80rpx" borderRadius="50%"
					border="1px solid #eee"></cloud-file>
				<view class="user-info">
					<view class="user-info-name">
						<view class="">{{setName(comment.user_id[0])}}</view>
						<view v-if="comment.user_id[0]._id == postUserId" class="id-label">作者</view>
					</view>
					<view class="user-info-desc">
						<uni-dateformat :date="comment.comment_date" format="M/d h:mm" :threshold="[60000, 3600000*24*30]">
						</uni-dateformat>
					</view>
				</view>
			</view>
		</view>

		<view class="body">
			<view class="content" @click="clickComment(commentIndex)">{{comment.comment_content}}</view>

			<view class="reply" v-for="(reply, index) in replies" :key="index">
				<view class="reply-user">
					<view class="reply-user-info">
						<cloud-file :src="setAvatar(reply.user_id[0])" width="40rpx" height="40rpx" borderRadius="50%"
							border="1px solid #eee"></cloud-file>
						<view class="reply-user-name">
							<view class="">{{setName(reply.user_id[0])}}</view>
							<view v-if="reply.user_id[0]._id == postUserId" class="id-label">作者</view>
						</view>
						<view v-if="reply.comment_type == 2" class="reply-to-user-info">
							<i class="icon iconfont icon-arrow-right-fill"></i>
							<view class="reply-user-name">
								<view class="">{{setName(reply.reply_user_id[0])}}</view>
								<view v-if="reply.reply_user_id[0]._id == postUserId" class="id-label">作者</view>
							</view>
						</view>
					</view>
					<view class="reply-user-desc">
						<uni-dateformat :date="reply.comment_date" format="M/d h:mm" :threshold="[60000, 3600000*24*30]">
						</uni-dateformat>
					</view>
				</view>
				<view class="reply-content" @click="clickReply({reply, commentIndex})">{{reply.comment_content}}</view>
			</view>

			<view v-if="comment.replyCount" class="reply-count">共{{comment.replyCount}}条回复</view>
		</view>
	</view>
</template>

<script>
	import {
		setName,
		setAvatar
	} from "@/common/utils.js";

	const db = uniCloud.database();

	export default {
		name: "comment",
		props: {
			comment: {
				type: Object,
				default: {}
			},
			commentIndex: {
				type: Number,
				default: 0
			},
			postUserId: {
				type: String,
				default: ""
			}
		},
		data() {
			return {
				postId: "",
				replies: []
			};
		},
		mounted() {
			this.postId = this.comment.post_id;
			this.getReplies();
		},
		methods: {
			setName,
			setAvatar,
			// 获取回复列表
			getReplies() {
				let tempComments = db.collection("db-posts-comments").where(
					`post_id == "${this.postId}" && (comment_type == 1 || comment_type == 2) && reply_comment_id == "${this.comment._id}"`
				).orderBy("comment_date desc").limit(5).getTemp();
				let tempUsers = db.collection("uni-id-users").field("_id, avatar_file, nickname").getTemp();

				db.collection(tempComments, tempUsers).get().then(res => {
					this.replies = res.result.data;
					// console.log(this.replies);
				})
			},
			clickComment(e) {
				this.$emit("comment", {
					comment: this.comment,
					commentIndex: e
				})
			},
			clickReply(e) {
				this.$emit("reply", {
					reply: e.reply,
					commentIndex: e.commentIndex
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.comment {
		margin-bottom: 30rpx;

		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;

			.user-wrap {
				display: flex;
				justify-content: flex-start;
				align-items: center;

				.user-info {
					display: flex;
					flex-direction: column;
					justify-content: space-around;
					margin: 0 20rpx;

					.user-info-name {
						font-size: 28rpx;
						display: flex;
						align-items: center;
					}

					.user-info-desc {
						font-size: 24rpx;
						color: #888;
					}
				}
			}
		}

		.body {
			margin-left: 100rpx;

			.content {
				margin: 10rpx 0 15rpx 0;
				font-size: 30rpx;
				color: #333;
			}

			.reply-count {
				width: fit-content;
				font-size: 22rpx;
				color: #666;
				padding: 8rpx 15rpx;
				background: #eee;
				border-radius: 10rpx;
			}

			.reply {
				width: 100%;
				padding: 20rpx 0;

				.reply-user {
					width: 100%;
					display: flex;
					justify-content: space-between;
					align-items: center;

					.reply-user-info {
						display: flex;
						align-items: center;

						.reply-user-name {
							font-size: 28rpx;
							margin-left: 10rpx;
							display: flex;
							align-items: center;
						}

						.reply-to-user-info {
							display: flex;
							align-items: center;
							margin-left: 10rpx;

							.icon {
								font-size: 28rpx;
								color: #aaa;
							}
						}
					}

					.reply-user-desc {
						font-size: 24rpx;
						color: #888;
					}
				}

				.reply-content {
					font-size: 28rpx;
					color: #333;
					margin-left: 50rpx;
				}
			}
		}
	}

	.id-label {
		background: #eee;
		border-radius: 5rpx;
		padding: 2rpx 10rpx;
		font-size: 18rpx;
		color: #666;
		display: flex;
		align-items: center;
		margin-left: 10rpx;
	}
</style>