<template>
	<nav-bar :showBackBtn="false" :showTitle="true" title="消息" justifyContent="center">
		<view class="iconfont icon-tick-circle-fill nav-icon" @click="handleReadAll"></view>
	</nav-bar>
	<safe-area></safe-area>

	<view class="container">
		<view class="group">
			<view class="item-wrap">
				<text class="title">系统消息</text>
				<view class="value-wrap">
					<text class="value"></text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
		</view>

		<view class="group">
			<view class="message" v-for="(item, index) in messages" :key="index" @click="toDetail(item, index)">
				<view class="content">
					<view v-if="!item.is_read" class="dot"></view>
					<cloud-file :src="item.from_user_avatar || '/static/images/avatar.svg'" width="40rpx" height="40rpx"
						borderRadius="50%"></cloud-file>
					<text class="title">
						<text class="name">{{item.from_user_name || "有人"}}</text>
						<text class="text">{{item.content}}</text>
					</text>
				</view>
				<view class="date">
					<uni-dateformat :date="item.date" format="M/d h:mm" :threshold="[60000, 3600000*24*30]">
					</uni-dateformat>
				</view>
			</view>
		</view>
	</view>

	<toast ref="toast"></toast>
	<popup ref="popup"></popup>

	<tab-bar :index="2"></tab-bar>
</template>

<script>
	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

	import {
		msgsStore
	} from "@/stores/messages.js";

	const db = uniCloud.database();

	export default {
		data() {
			return {
				messages: []
			};
		},
		computed: {
			userInfo() {
				return store.userInfo
			}
		},
		onLoad() {
			this.getMessages();
		},
		methods: {
			handleReadAll() {
				this.messages.forEach(item => {
					if (!item.is_read) {
						item.is_read = true;
					}
				});

				msgsStore().clearTempMsgs();

				db.collection("db-messages").where(`is_read == false`).update({
					is_read: true
				}).then(() => {
					this.$refs.toast.show({
						type: "success",
						text: "消息全部已读",
						duration: "2000"
					});
				});
			},
			handleRead(msgId) {
				db.collection("db-messages").where(`_id == "${msgId}"`).update({
					is_read: true
				});
			},
			toDetail(item, index) {
				if (item.type == "like" || item.type == "comment" || item.type == "reply") {
					this.handleRead(item._id);
					this.messages[index].is_read = true;

					uni.navigateTo({
						url: "/pages-post/post-detail/post-detail?id=" + item.post_id
					});
				}
			},
			async getMessages() {
				let res = await db.collection("db-messages").where(`user_id == "${this.userInfo._id}"`).orderBy(
					"date desc, is_read").limit(20).get();
				let messages = res.result.data;

				this.messages = messages;

				console.log(this.messages);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.nav-icon {
		font-size: 30rpx;
		color: #aaa;
		margin-left: 15rpx;
		line-height: 100%;
	}

	.container {
		padding: 25rpx;

		.group {
			border-radius: 20rpx;
			overflow: hidden;
			margin-bottom: 20rpx;

			.item-wrap,
			.message {
				height: 120rpx;
				padding: 20rpx;
				display: flex;
				justify-content: space-between;
				align-items: center;
				background: #fff;
				transition: background .15s;

				&:active {
					background: #eee;
				}

				.title {
					font-size: 28rpx;
				}

				.value-wrap {
					display: flex;
					justify-content: flex-end;
					align-items: center;

					.value {
						font-size: 22rpx;
						color: #999;
					}

					.iconfont {
						font-size: 28rpx;
						margin-left: 20rpx;
					}
				}
			}

			.message {
				.content {
					display: flex;
					align-items: center;

					.dot {
						width: 15rpx;
						height: 15rpx;
						border-radius: 50%;
						background: indianred;
						margin-right: 10rpx;
					}

					.title {
						font-size: 28rpx;
						margin-left: 15rpx;

						.text {
							margin-left: 15rpx;
						}
					}
				}

				.date {
					font-size: 24rpx;
					color: #999;
				}
			}
		}
	}
</style>