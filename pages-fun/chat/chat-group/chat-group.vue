<template>
	<nav-bar>
		<avatar-group :avatars="avatars" :moreText="joinCount > 5 ? (joinCount < 100 ? `${joinCount}+` : joinCount) : '···'"
			radius="32px" borderColor="#f5f5f5"></avatar-group>
	</nav-bar>

	<view class="container" :style="{paddingTop: `${navHeight}px`, paddingBottom: `${footerHeight + keyboardHeight}px`}">
		<scroll-view class="chat-list-wrap" scroll-y scroll-with-animation @scrolltolower="onScrollMore">
			<view class="chat-list">
				<view class="chat-msg" v-for="(item, index) in msgs" :key="item._id" @longpress="pressMsg(index)">
					<chat-msg :id="'msg-' + item._id" :data="item" :isSelf="item.from_uid[0]._id == userInfo._id"
						:showFun="item.showFun" @reply="onReply(item)"></chat-msg>
				</view>
			</view>
			<view class="load-more">
				<load-more v-if="!noMore" :status="loadMore"></load-more>
			</view>
		</scroll-view>
	</view>

	<send-view moreFun :replyMsg="replyMsg" :focus="autoFocus" @send="send" @height="getFooterHeight" @focus="onFocus"
		@blur="onBlur" ref="sendView"></send-view>

	<toast ref="toast"></toast>
</template>

<script>
	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

	import {
		uploadFile,
		checkContent,
		checkMedia
	} from "@/common/cloud.js";

	import {
		throttle
	} from "@/common/utils.js";

	const db = uniCloud.database();
	const utils = uniCloud.importObject("utils", {
		customUI: true
	});
	const pushMsg = uniCloud.importObject("push-msg", {
		customUI: true
	});
	const joinDb = db.collection("db-chat-group-join");
	const msgDb = db.collection("db-chat-msg");

	export default {
		data() {
			return {
				msgs: [],
				msg: {},
				tempMsg: {},
				footerHeight: 0,
				keyboardHeight: 0,
				avatars: [],
				joinCount: 0,
				tempHeight: 0,
				navHeight: 0,
				loadMore: "loading",
				noMore: true,
				replyMsg: {},
				autoFocus: false
			};
		},
		onLoad() {
			let {
				statusBarHeight
			} = getApp().globalData.systemInfo;

			this.navHeight = statusBarHeight + 44;

			this.joinGroup();
			this.getMsgs();
		},
		onUnload() {
			this.leaveGroup();
		},
		created() {
			uni.onPushMessage(res => {
				console.log(res);
				let receiveMsg = res.data.payload;
				if (receiveMsg.from_uid[0]._id != this.userInfo._id) {
					this.msgs.push(receiveMsg);
				}
			});
		},
		computed: {
			userInfo() {
				return store.userInfo;
			}
		},
		methods: {
			onReply(item) {
				this.replyMsg = item;
				// console.log(item);
				this.autoFocus = true;
			},
			pressMsg(index) {
				uni.vibrateShort({
					success: () => {
						this.msgs[index].showFun = true;
						setTimeout(() => {
							this.msgs[index].showFun = false;
						}, 3000);
					}
				})
			},
			async getAvatars() {
				let tempJoin = await joinDb.field("update_time, user_id").orderBy("update_time").limit(5).getTemp();
				let tempUsers = await db.collection("uni-id-users").field("_id, avatar_file").getTemp();

				let res = await db.collection(tempJoin, tempUsers).get();
				// console.log(res);
				this.avatars = res.result.data;

				joinDb.count().then(res => {
					this.joinCount = res.result.total;
				});
			},
			async getMsgs(e = {}) {
				const {
					loadMore
				} = e;

				let limit = 10;
				let skip = 0;

				if (loadMore) {
					skip = this.msgs.length;
				}

				let tempMsgs = await msgDb.where(`sec_check != 1`).orderBy("create_time desc")
					.skip(skip).limit(limit).getTemp();
				let tempUsers = await db.collection("uni-id-users").field("_id, avatar_file, nickname").getTemp();

				let res = await db.collection(tempMsgs, tempUsers).get();

				let resData = res.result.data.reverse();

				if (loadMore) {
					this.msgs.unshift(...resData);

					if (!resData.length) {
						this.noMore = true;
					}
				} else {
					this.msgs = resData;
				}
			},
			leaveGroup() {
				joinDb.where(`user_id == $cloudEnv_uid`).remove();
			},
			async joinGroup() {
				let count = await joinDb.where(`user_id == $cloudEnv_uid`).count();

				if (count.result.total == 0) {
					joinDb.add({});
				} else {
					joinDb.where(`user_id == $cloudEnv_uid`).update({
						update_time: Date.now()
					});
				}

				this.getAvatars();
			},
			async send(e) {
				// console.log(e);
				this.msg = {};

				if (e.value) {
					this.msg.text = e.value;
					// 文本安全检测
					await checkContent(this.msg.text).then(res => {
						console.log(res);
						if (res == 1) {
							this.msg.sec_check = 1;
						}
					});
				}

				if (e.images) {
					let fileIds = await uploadFile({
						tempPaths: e.images,
						path: "chat/images/"
					});

					this.msg.images = fileIds;

					// 图片安全检测
					this.msg.images.map(async item => {
						await checkMedia(item).then(res => {
							console.log(res);
							if (res == 1) {
								this.msg.sec_check = 1;
								return;
							}
						});
					});
				}

				if (e.videos) {
					let fileIds = await uploadFile({
						tempPaths: e.videos,
						path: "chat/videos/"
					});

					this.msg.videos = fileIds;

					// 视频安全检测
					this.msg.videos.map(async item => {
						await checkMedia(item).then(res => {
							console.log(res);
							if (res == 1) {
								this.msg.sec_check = 1;
								return;
							}
						});
					});
				}

				if (e.reply_to_id) {
					this.msg.reply_to_id = e.reply_to_id;
				}

				msgDb.add(this.msg).then(res => {
					if (this.msg.sec_check && this.msg.sec_check == 1) {
						this.$refs.toast.show({
							type: "error",
							text: "内容违规",
							duration: "2000"
						});
					} else {
						this.sendFront(res.result.id);

						let param = {
							user_id: [],
							payload: {
								type: "chat-group",
								...this.tempMsg
							}
						};

						pushMsg.sendMsgToGroup({
							param
						});
					}
				}).catch(err => {
					console.log(err);
				});
			},
			sendFront(id) {
				this.tempMsg = {
					_id: id,
					from_uid: [{
						_id: store.userInfo._id,
						avatar_file: {
							url: store.userInfo.avatar_file?.url
						},
						nickname: store.userInfo.nickname
					}],
					create_time: Date.now(),
					...this.msg
				};

				this.msgs.push(this.tempMsg);

				this.$refs.sendView.reset();
				this.autoFocus = false;
			},
			onFocus(e) {
				this.keyboardHeight = e;
			},
			onBlur() {
				this.keyboardHeight = 0;
			},
			getFooterHeight(e) {
				this.footerHeight = e;
			},
			onScrollMore: throttle(function() {
				this.noMore = false;
				this.loadMore = "loading";
				this.getMsgs({
					loadMore: true
				});
			})
		}
	}
</script>

<style>
	::-webkit-scrollbar {
		display: none;
		width: 0;
		height: 0;
		color: transparent;
	}
</style>

<style lang="scss" scoped>
	.container {
		height: 100vh;
		transition: padding .3s;

		.chat-list-wrap {
			height: 100%;
			transform: rotate(180deg);

			.chat-list {
				padding: 25rpx;
				transform: rotate(180deg);

				.chat-msg {
					&:not(:last-child) {
						margin-bottom: 50rpx;
					}
				}
			}

			.load-more {
				transform: rotate(180deg);
			}
		}
	}
</style>