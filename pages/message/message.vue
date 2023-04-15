<template>
	<nav-bar :showBackBtn="false" :showTitle="true" title="消息" justifyContent="center">
		<view class="iconfont icon-tick-circle-fill nav-icon" @click="handleReadAll"></view>
	</nav-bar>
	<safe-area></safe-area>

	<view class="container">
		<view class="system-item" @click="toMessageSystem">
			<text class="title">系统消息</text>
			<view class="value-wrap">
				<text class="value"></text>
				<i class="iconfont icon-arrow-right"></i>
			</view>
		</view>

		<default-view v-if="!isLoading && !messages.length" text="暂无消息"></default-view>

		<pull-down v-else @start="refreshStart" ref="refresh">
			<view class="group">
				<view class="message" v-for="(item, index) in messages" :key="index" @click="toDetail(item, index)">
					<view class="avatar">
						<cloud-file :src="item.from_user_avatar" width="80rpx" height="80rpx" borderRadius="50%"></cloud-file>
						<view v-if="!item.is_read" class="dot"></view>
					</view>

					<view class="content">
						<view class="title-wrap">
							<text class="title">{{item.from_user_name || "有人"}} {{item.content}}</text>

							<view class="date">
								<uni-dateformat :date="item.date" format="M/d h:mm" :threshold="[60000, 3600000*24*30]">
								</uni-dateformat>
							</view>
						</view>

						<view class="excerpt">{{item.excerpt}}</view>
					</view>
				</view>
			</view>

			<load-more v-if="!isLoading" :status="loadMore"></load-more>
		</pull-down>
	</view>

	<safe-area type="tabBar"></safe-area>

	<load-view :isLoading="isLoading" background="rgba(0,0,0,0)"></load-view>

	<toast ref="toast"></toast>
	<popup ref="popup"></popup>

	<tab-bar :index="2"></tab-bar>
</template>

<script>
	import {
		store as uniIdStore
	} from "@/uni_modules/uni-id-pages/common/store.js";

	import store from "@/store/index.js";

	const db = uniCloud.database();
	const utils = uniCloud.importObject("utils", {
		customUI: true
	});

	export default {
		data() {
			return {
				messages: [],
				isLoading: true,
				loadMore: "",
				noMore: false
			};
		},
		computed: {
			userInfo() {
				return uniIdStore.userInfo
			}
		},
		onLoad() {
			this.getMessages();
		},
		methods: {
			refreshStart() {
				this.getMessages();
			},
			toMessageSystem() {
				uni.navigateTo({
					url: "/pages/message/message-system/message-system"
				});
			},
			async handleReadAll() {
				this.messages.forEach(item => {
					if (!item.is_read) {
						item.is_read = true;
					}
				});

				store.commit("clearTempMsgs");

				await db.collection("db-messages").where(`user_id == $cloudEnv_uid && is_read != true`).update({
					is_read: true
				});

				this.$refs.toast.show({
					type: "success",
					text: "消息全部已读",
					duration: "2000"
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
				} else if (item.type == "relationship") {
					this.handleRead(item._id);
					this.messages[index].is_read = true;

					// console.log(item);
					this.$refs.popup.show({
						type: "text",
						title: "提示",
						text: "你确定要同意 " + item.from_user_name + " 的邀请吗？",
						success: async () => {
							this.$refs.popup.hide();

							await db.collection("uni-id-users").where(`_id == "${item.user_id}"`).update({
								lover_id: item.from_user_id
							});

							await utils.updateData("uni-id-users", item.from_user_id, {
								lover_id: item.user_id
							});

							this.$refs.toast.show({
								type: "success",
								text: "关联成功",
								duration: "2000"
							});

							uniCloud.callFunction({
								name: "push",
								data: {
									user_id: item.from_user_id,
									payload: {
										type: "relationship_callback",
										content: this.userInfo.nickname + "已同意与你关联为恋人",
										user_id: item.from_user_id,
										excerpt: "愿我如星君如月，夜夜流光相皎洁。",
										from_user_id: this.userInfo._id,
										from_user_name: this.userInfo.nickname,
										from_user_avatar: this.userInfo.avatar_file.url,
										date: Date.now()
									}
								}
							});
						}
					});
				}
			},
			async getMessages(e = {}) {
				const {
					loadMore = false
				} = e;

				let skip = 0;
				if (loadMore) {
					skip = this.messages.length;
				}

				let res = await db.collection("db-messages").where(`user_id == $cloudEnv_uid`).orderBy(
					"date desc, is_read").skip(skip).limit(20).get();

				let resData = [];

				if (loadMore) {
					if (res.result.data.length == 0) {
						this.noMore = true;
					}
					resData = [...this.messages, ...res.result.data];
				} else {
					this.messages = [];
					resData = res.result.data;
					this.noMore = false;
				}

				this.messages = resData;

				this.isLoading = false;

				this.loadMore = "";

				setTimeout(() => {
					this.$refs.refresh.success();
				}, 300);

				// console.log(this.messages);
			}
		},
		onPageScroll(e) {
			uni.$emit("onPageScroll", e.scrollTop);
		},
		onReachBottom() {
			this.loadMore = "loading";
			if (this.noMore) {
				setTimeout(() => {
					this.loadMore = "noMore";
				}, 500);
				return;
			};
			this.getMessages({
				loadMore: true
			});
		}
	}
</script>

<style lang="scss" scoped>
	.nav-icon {
		font-size: 34rpx;
		color: #aaa;
		margin-left: 15rpx;
		line-height: 44px;
	}

	.container {
		padding: 25rpx;

		.system-item {
			height: 120rpx;
			padding: 20rpx;
			border-radius: 20rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			background: #fff;
			margin-bottom: 25rpx;
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

		.group {
			border-radius: 20rpx;
			overflow: hidden;

			.message {
				display: flex;
				align-items: center;
				height: 150rpx;
				padding: 20rpx;
				background: #fff;
				transition: background .15s;

				&:active {
					background: #eee;
				}

				.avatar {
					position: relative;
					width: fit-content;
					height: fit-content;

					.dot {
						position: absolute;
						top: 0;
						right: 0;
						width: 15rpx;
						height: 15rpx;
						border-radius: 50%;
						border: 2px solid #fff;
						box-sizing: content-box;
						background: indianred;
					}
				}

				.content {
					flex: 1;
					margin-left: 20rpx;

					.title-wrap {
						display: flex;
						justify-content: space-between;
						align-items: center;

						.title {
							font-size: 28rpx;
							color: #333;
						}

						.date {
							font-size: 24rpx;
							color: #999;
						}
					}

					.excerpt {
						font-size: 24rpx;
						color: #999;
						margin-top: 5rpx;
					}
				}
			}
		}
	}
</style>