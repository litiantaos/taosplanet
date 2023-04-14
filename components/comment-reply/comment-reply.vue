<template>
	<view class="reply">
		<view class="reply-user">
			<view class="reply-user-info">
				<cloud-file :src="data.user_id[0]" width="40rpx" height="40rpx" borderRadius="50%"
					border="1px solid #eee"></cloud-file>
				<view class="reply-user-name">
					<view class="">
						<name-init :data="data.user_id[0]"></name-init>
					</view>
					<view v-if="data.user_id[0]._id == postUserId" class="id-label">作者</view>
				</view>
				<view v-if="data.comment_type == 2" class="reply-to-user-info">
					<i class="icon iconfont icon-arrow-right-fill"></i>
					<view class="reply-user-name">
						<view class="">
							<name-init :data="data.reply_user_id[0]"></name-init>
						</view>
						<view v-if="data.reply_user_id[0]._id == postUserId" class="id-label">作者</view>
					</view>
				</view>
			</view>
			<view class="like">
				<like-handler :isLike="data.isLike" :isClick="isClickLike" left @click="clickLike"></like-handler>
			</view>
		</view>
		<view class="reply-content-wrap">
			<view class="reply-content" @click="clickReply(data, replyIndex)">{{data.comment_content}}</view>
			<view class="reply-user-desc">
				<uni-dateformat :date="data.comment_date" format="M/d h:mm" :threshold="[60000, 3600000*24*30]">
				</uni-dateformat>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "comment-reply",
		props: {
			data: {
				type: Object,
				default: {}
			},
			replyIndex: {
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
				isClickLike: false
			};
		},
		methods: {
			clickLike() {
				// 
			},
			clickReply(data, replyIndex) {
				this.$emit("onReply", {
					reply: data,
					replyIndex: replyIndex
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.reply {
		width: 100%;

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
		}

		.reply-content-wrap {
			margin-left: 50rpx;

			.reply-content {
				font-size: 28rpx;
				color: #333;
				margin-top: 10rpx;
			}

			.reply-user-desc {
				font-size: 24rpx;
				color: #999;
				margin-top: 10rpx;
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