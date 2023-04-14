<template>
	<view class="comment">
		<view class="header">
			<view class="user-wrap">
				<cloud-file :src="data.user_id[0]" width="80rpx" height="80rpx" borderRadius="50%"
					border="1px solid #eee"></cloud-file>
				<view class="user-info">
					<view class="user-info-name">
						<name-init :data="data.user_id[0]"></name-init>
						<view v-if="data.user_id[0]._id == postUserId" class="id-label">作者</view>
					</view>
					<view class="user-info-desc">
						<uni-dateformat :date="data.comment_date" format="M/d h:mm" :threshold="[60000, 3600000*24*30]">
						</uni-dateformat>
					</view>
				</view>
			</view>
			<view class="like">
				<like-handler :isLike="data.isLike" :isClick="isClickLike" left @click="clickLike"></like-handler>
			</view>
		</view>

		<view class="body">
			<view class="content" @click="clickComment(commentIndex)">{{data.comment_content}}</view>

			<view class="replies" v-for="(item, index) in replies" :key="index">
				<comment-reply :data="item" :replyIndex="index" :postUserId="postUserId" @onReply="onReply"></comment-reply>
			</view>

			<view v-if="data.replyCount" class="reply-count">共{{data.replyCount}}条回复</view>
		</view>
	</view>
</template>

<script>
	const db = uniCloud.database();

	export default {
		name: "comment",
		props: {
			data: {
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
				replies: [],
				isClickLike: false
			};
		},
		mounted() {
			this.postId = this.data.post_id;
			this.getReplies();
		},
		methods: {
			clickLike() {
				// 
			},
			// 获取回复列表
			getReplies() {
				let tempComments = db.collection("db-posts-comments").where(
					`post_id == "${this.postId}" && (comment_type == 1 || comment_type == 2) && reply_comment_id == "${this.data._id}"`
				).orderBy("comment_date desc").limit(5).getTemp();
				let tempUsers = db.collection("uni-id-users").field("_id, avatar_file, nickname").getTemp();

				db.collection(tempComments, tempUsers).get().then(res => {
					this.replies = res.result.data;
					// console.log(this.replies);
				})
			},
			clickComment(e) {
				this.$emit("onComment", {
					comment: this.data,
					commentIndex: e
				});
			},
			onReply(e) {
				this.$emit("onReply", e);
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
						color: #999;
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

			.replies {
				width: 100%;
				padding: 20rpx 0;
			}

			.reply-count {
				width: fit-content;
				font-size: 20rpx;
				color: #666;
				padding: 5rpx 15rpx;
				background: #eee;
				border-radius: 8rpx;
			}
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
		margin-left: 10rpx;
	}
</style>