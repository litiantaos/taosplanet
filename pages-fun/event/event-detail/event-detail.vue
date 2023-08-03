<template>
	<view class="container">
		<view class="event-info">
			<view class="title-wrap">
				<view class="title">{{event.title}}</view>
				<view class="iconfont icon-more-circle" @click="clickMore"></view>
			</view>
			<view class="region">{{event.region?.province}} {{event.region?.city}}</view>

			<view class="deadline">
				截止报名：
				<uni-dateformat :date="event.deadline" format="yyyy/MM/dd hh:mm"></uni-dateformat>
			</view>

			<view class="date">
				活动时间：
				<uni-dateformat :date="event.start_date" format="yyyy/MM/dd hh:mm"></uni-dateformat>
				<view v-if="event.end_date">
					<text style="margin: 0 15rpx;">-</text>
					<uni-dateformat :date="event.end_date" format="yyyy/MM/dd hh:mm"></uni-dateformat>
				</view>
			</view>

			<view class="intro">{{event.intro}}</view>

			<view v-if="event.location" class="location">
				<map-card :data="location" showMarker :showFront="true" :text="event.location_name" borderRadius="15rpx"
					@click="openLocation"></map-card>
			</view>

			<view v-if="images.length" class="images">
				<view class="image-wrap" v-for="(item, index) in images" :key="index">
					<image class="image" :src="item" mode="aspectFill" @click="previewImage(index)"></image>
				</view>
			</view>

			<view class="info">
				<view>{{event.view_count}}人看过</view>
				<view>
					<uni-dateformat :date="event.publish_date" format="yyyy/M/d h:mm" :threshold="[60000, 3600000*24*30]">
					</uni-dateformat> 发布
				</view>
			</view>
		</view>
		<view class="user-list">
			<view class="user" v-for="(item, index) in users" :key="index">
				<view class="user-info">
					<view class="user-info-pre">
						<cloud-file :src="item.user_id[0]" width="50rpx" height="50rpx" borderRadius="50%"
							border="1px solid #eee"></cloud-file>
						<view class="user-info-name">
							<name-init :data="item.user_id[0]"></name-init>
						</view>
						<view v-if="item.is_creator" class="user-tag">组织者</view>
					</view>
					<view class="user-date">
						<uni-dateformat :date="item.date" format="M/d h:mm" :threshold="[60000, 3600000*24*30]">
						</uni-dateformat>
					</view>
				</view>

				<view v-if="item.is_creator" class="comment">欢迎大家来参加哦~</view>
				<view v-else class="comment">{{item.comment || "我要参加"}}</view>

				<view class="line"></view>
			</view>
		</view>
	</view>
	<safe-area type="bottom"></safe-area>

	<float-button :theme="isParticipated ? 'red' : 'dark'" :text="isParticipated ? '取消参加' : '我要参加'" bottomHeight="20px"
		@click="joinEvent"></float-button>

	<toast ref="toast"></toast>
	<popup ref="popup"></popup>
	<tooltip ref="tooltip"></tooltip>
</template>

<script>
	import {
		getTempFileURL
	} from "@/common/cloud.js";

	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

	const db = uniCloud.database();
	const utils = uniCloud.importObject("utils", {
		customUI: true
	});

	export default {
		data() {
			return {
				eventId: "",
				event: {},
				images: [],
				location: {},
				users: [],
				data: {},
				isParticipated: false
			};
		},
		onLoad(e) {
			if (e) {
				this.eventId = e.id;
				this.getEvent();

				if (store.hasLogin) {
					this.checkStatusInit();
				}
			}
		},
		computed: {
			userInfo() {
				return store.userInfo;
			},
			hasLogin() {
				return store.hasLogin;
			}
		},
		methods: {
			clickMore() {
				let actions = [{
						text: "转发到动态",
						icon: "icon-send-t",
					},
					{
						text: "分享到微信",
						icon: "icon-wechat",
						color: "#2aae67"
					}
				];

				if (this.hasLogin && this.userInfo._id == this.event.user_id) {
					actions.push({
						text: "删除",
						icon: "icon-archive-slash",
						color: "#E06C75"
					});
				}

				this.$refs.popup.show({
					type: "action",
					title: "操作",
					actions: actions,
					success: index => {
						if (index == 0) {
							uni.setStorageSync("event-share", this.event);
							this.$refs.popup.hide();
							uni.navigateTo({
								url: "/pages-fun/event/event-share/event-share"
							});
						} else if (index == 1) {
							this.$refs.tooltip.show();
						} else if (index == 2) {
							this.deleteEvent();
						}
					}
				})
			},
			deleteEvent() {
				this.$refs.popup.show({
					size: "small",
					type: "text",
					title: "提示",
					text: "你确定要删除此活动吗？",
					success: res => {
						this.$refs.toast.show({
							type: "loading",
							text: "删除中",
							duration: "none"
						});
						db.collection("db-events").where(`_id == "${this.eventId}"`).remove().then(res => {
							db.collection("db-events-participants").where(`event_id == "${this.eventId}"`).remove()
								.then(() => {
									this.$refs.toast.show({
										type: "success",
										text: "删除成功",
										duration: "2000"
									});
									this.$refs.popup.hide();
									setTimeout(() => {
										let pages = getCurrentPages();
										let prevPage = pages[pages.length - 2];

										prevPage.$vm.getEvents();

										uni.navigateBack();
									}, 1000);
								});
						});
					}
				});
			},
			openLocation() {
				uni.openLocation({
					longitude: this.location.longitude,
					latitude: this.location.latitude,
					success: res => {
						// console.log(res);
					}
				});
			},
			async getUsers() {
				let tempParticipants = await db.collection("db-events-participants")
					.where(`event_id == "${this.eventId}"`).orderBy("is_creator desc, date desc").getTemp();
				let tempUsers = await db.collection("uni-id-users").field("_id, avatar_file, nickname").getTemp();
				let res = await db.collection(tempParticipants, tempUsers).get();
				this.users = res.result.data;
				console.log(res);
			},
			addData() {
				this.data.event_id = this.eventId;

				db.collection("db-events-participants").add(this.data).then(res => {
					this.getUsers();

					utils.calc("db-events", "participant_count", this.eventId, 1);

					this.$refs.toast.show({
						type: "success",
						text: "参加成功",
						duration: "2000"
					});
				});
			},
			async checkStatusInit() {
				let res = await db.collection("db-events-participants")
					.where(`event_id == "${this.eventId}" && user_id == $cloudEnv_uid`).count();

				let uid = uniCloud.getCurrentUserInfo().uid;

				if (res.result.total != 0 || uid == this.event.user_id) {
					this.isParticipated = true;
				}
			},
			async checkStatus() {
				let res = await db.collection("db-events-participants")
					.where(`event_id == "${this.eventId}"`).count();

				if (Date.now() > this.event.deadline) {
					this.$refs.toast.show({
						type: "info",
						text: "报名已截止",
						duration: "2000"
					});
				} else if (res.result.total == this.event.limited_participant_count - 1) {
					this.$refs.toast.show({
						type: "info",
						text: "报名人数已满",
						duration: "2000"
					});
				} else {
					this.$refs.popup.show({
						size: "medium",
						type: "input",
						title: "参加活动",
						inputIn: {
							placeholder: "可以留言哦~",
							value: this.data.comment || "我要参加"
						},
						success: res => {
							this.data.comment = res;
							this.isParticipated = true;
							this.addData();
							this.$refs.popup.hide();
						}
					});
				}
			},
			joinEvent() {
				if (this.isParticipated) {
					this.$refs.popup.show({
						size: "small",
						type: "text",
						title: "参加活动",
						text: "你确定要取消参加此活动吗？",
						success: res => {
							let uid = uniCloud.getCurrentUserInfo().uid;
							if (uid == this.event.user_id) {
								this.$refs.toast.show({
									type: "info",
									text: "创建人不可取消哦~",
									duration: "2000"
								});
								this.$refs.popup.hide();
								return;
							}

							this.isParticipated = false;

							db.collection("db-events-participants")
								.where(`event_id == "${this.eventId}" && user_id == $cloudEnv_uid`).remove().then(() => {
									this.$refs.toast.show({
										type: "success",
										text: "取消成功",
										duration: "2000"
									});

									utils.calc("db-events", "participant_count", this.eventId, -1);

									this.getUsers();
								});

							this.$refs.popup.hide();
						}
					});
				} else {
					if (store.hasLogin) {
						this.checkStatus();
					} else {
						this.$refs.popup.show({
							size: "small",
							type: "text",
							title: "提示",
							text: "请登录后再参与吧~",
							success: res => {
								uni.navigateTo({
									url: "/pages/login/login"
								});
								this.$refs.popup.hide();
							}
						});
					}
				}
			},
			previewImage(index) {
				uni.previewImage({
					current: index,
					urls: this.images
				});
			},
			updateViewCount() {
				utils.calc("db-events", "view_count", this.eventId, 1);
			},
			async getEvent() {
				let res = await db.collection("db-events").where(`_id == "${this.eventId}"`).get();

				console.log(res);

				this.event = res.result.data[0];

				if (this.event.images) {
					this.images = await getTempFileURL(this.event.images);
				}

				if (this.event.location) {
					this.location.longitude = this.event.location.coordinates[0];
					this.location.latitude = this.event.location.coordinates[1];
				}

				this.getUsers();
				this.updateViewCount();

				setTimeout(() => {
					uni.stopPullDownRefresh();
				}, 300);
			}
		},
		onPageScroll(e) {
			uni.$emit("onPageScroll", e.scrollTop);
		},
		onPullDownRefresh() {
			this.getEvent();
		},
		onShareAppMessage() {
			return {
				title: this.event.title,
				path: "/pages-fun/event/event-detail/event-detail?id=" + this.eventId
			}
		},
		onShareTimeline() {
			return {
				title: this.event.title,
				query: "id=" + this.eventId + "&from=timeline"
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		padding: 25rpx;

		.event-info {
			padding: 25rpx;
			background: #fff;
			border-radius: 20rpx;
			margin-bottom: 25rpx;

			.title-wrap {
				display: flex;
				justify-content: space-between;
				align-items: center;

				.title {
					font-size: 36rpx;
					font-weight: bold;
					color: #333;
					margin: 20rpx 0;
				}

				.iconfont {
					font-size: 36rpx;
					color: #666;
				}
			}

			.region,
			.date,
			.deadline {
				width: fit-content;
				height: 50rpx;
				background: #f5f5f5;
				border-radius: 10rpx;
				display: flex;
				align-items: center;
				font-size: 24rpx;
				color: #666;
				padding: 0 20rpx;
				margin-top: 25rpx;
			}

			.location {
				font-size: 24rpx;
				color: #333;
				border: 1px solid #eee;
				box-sizing: border-box;
				border-radius: 15rpx;
				margin-top: 25rpx;
			}

			.intro {
				font-size: 28rpx;
				color: #333;
				text-align: justify;
				margin: 50rpx 0;
			}

			.images {
				margin-top: 25rpx;

				.image-wrap {

					.image {
						width: 100%;
						background: #eee;
						border-radius: 15rpx;
						box-sizing: border-box;
						vertical-align: bottom;
					}

					&:not(:last-child) {
						margin-bottom: 25rpx;
					}
				}
			}

			.info {
				display: flex;
				justify-content: space-between;
				font-size: 24rpx;
				color: #999;
				margin-top: 40rpx;
				margin-bottom: 10rpx;
			}
		}

		.user-list {
			.user {
				position: relative;
				width: 100%;
				padding: 25rpx;
				background: #fff;
				border-radius: 20rpx;
				margin-bottom: 25rpx;

				.user-info {
					display: flex;
					justify-content: space-between;
					align-items: center;

					.user-info-pre {
						display: flex;
						align-items: center;

						.user-info-name {
							font-size: 28rpx;
							font-weight: bold;
							margin-left: 15rpx;
						}

						.user-tag {
							padding: 2rpx 10rpx;
							background: #eee;
							border-radius: 5rpx;
							font-size: 18rpx;
							color: #333;
							margin-left: 15rpx;
						}
					}

					.user-date {
						font-size: 22rpx;
						color: #999;
						margin-left: 15rpx;
					}
				}

				.comment {
					font-size: 24rpx;
					color: #999;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					margin-left: 65rpx;
				}

				.line {
					position: absolute;
					top: -25rpx;
					left: 48rpx;
					width: 4rpx;
					height: 25rpx;
					background: #ccc;
				}
			}
		}
	}
</style>