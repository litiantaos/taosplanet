<template>
	<view class="container">
		<view class="event-info">
			<view class="title">{{event.title}}</view>
			<view class="region">{{event.region?.province}} {{event.region?.city}}</view>

			<view class="deadline">
				<uni-dateformat :date="event.deadline" format="MM/dd hh:mm"></uni-dateformat>
				截止报名
			</view>

			<view class="intro">{{event.intro}}</view>

			<view class="date">
				活动时间：<uni-dateformat :date="event.start_date" format="MM/dd hh:mm"></uni-dateformat> -
				<uni-dateformat :date="event.end_date" format="MM/dd hh:mm"></uni-dateformat>
			</view>

			<view class="location">
				<map-card :data="location" showMarker :showFront="true" :text="event.location_name"
					borderRadius="15rpx"></map-card>
			</view>

			<view v-if="images.length" class="media">
				<view v-for="(item, index) in images" :key="index">
					<image class="image" :src="item" mode="aspectFill" @click="previewImage(index)"></image>
				</view>
			</view>

			<view class="info">
				<view class="">{{event.view_count}}人看过</view>
				<view class="">
					<uni-dateformat :date="event.publish_date" format="M/d h:mm" :threshold="[60000, 3600000*24*30]">
					</uni-dateformat>发布
				</view>
			</view>

		</view>
		<view v-if="event.user_id" class="user-list">
			<view class="user">
				<view class="user-info">
					<view class="user-info-pre">
						<cloud-file :src="event.user_id[0]" width="50rpx" height="50rpx" borderRadius="50%"
							border="1px solid #eee"></cloud-file>
						<view class="user-info-name">
							<name-init :data="event.user_id[0]"></name-init>
						</view>
						<view class="user-tag">组织者</view>
					</view>
					<view class="user-date">
						<uni-dateformat :date="event.publish_date" format="M/d h:mm" :threshold="[60000, 3600000*24*30]">
						</uni-dateformat>
					</view>
				</view>
				<view class="comment">我要参加</view>
			</view>

			<view class="user" v-for="(item, index) in users" :key="index">
				<view class="user-info">
					<view class="user-info-pre">
						<cloud-file :src="item.user_id[0]" width="50rpx" height="50rpx" borderRadius="50%"
							border="1px solid #eee"></cloud-file>
						<view class="user-info-name">
							<name-init :data="item.user_id[0]"></name-init>
						</view>
					</view>
					<view class="user-date">
						<uni-dateformat :date="item.date" format="M/d h:mm" :threshold="[60000, 3600000*24*30]">
						</uni-dateformat>
					</view>
				</view>
				<view class="comment">{{item.comment || "我要参加"}}</view>
			</view>
		</view>
	</view>
	<safe-area type="bottom"></safe-area>
	<float-button custom="dark" text="我要参加" bottomHeight="20px" @click="join"></float-button>
	<toast ref="toast"></toast>
	<popup ref="popup"></popup>
</template>

<script>
	import {
		getTempFileURL
	} from "@/common/cloud.js";

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
				data: {}
			};
		},
		onLoad(e) {
			if (e) {
				this.eventId = e.id;
				this.getEvent();
				this.getUsers();
			}
		},
		methods: {
			async getUsers() {
				let tempParticipants = await db.collection("db-events-participants")
					.where(`event_id == "${this.eventId}"`).orderBy("date desc").getTemp();
				let tempUsers = await db.collection("uni-id-users").field("_id, avatar_file, nickname").getTemp();
				let res = await db.collection(tempParticipants, tempUsers).get();
				this.users = res.result.data;
				console.log(res);
			},
			addData() {
				this.data.event_id = this.eventId;

				db.collection("db-events-participants").add(this.data).then(res => {
					this.getUsers();

					this.$refs.toast.show({
						type: "success",
						text: "参加成功",
						duration: "2000"
					});
				});
			},
			async checkDuplicate() {
				let res = await db.collection("db-events-participants")
					.where(`event_id == "${this.eventId}" && user_id == $cloudEnv_uid`).count();

				if (res.result.total == 0) {
					this.addData();
				} else {
					this.$refs.toast.show({
						type: "info",
						text: "你已经参加了哦",
						duration: "2000"
					});
				}
			},
			join() {
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
						this.checkDuplicate();
						this.$refs.popup.hide();
					}
				});
			},
			updateViewCount() {
				utils.calc("db-events", "view_count", this.eventId, 1);
			},
			async getEvent() {
				let tempEvent = await db.collection("db-events").where(`_id == "${this.eventId}"`)
					.field(
						"title, intro, start_date, end_date, deadline, user_id, region, publish_date, images, location_name, location, view_count"
					).getTemp();
				let tempUser = await db.collection("uni-id-users").field("_id, avatar_file, nickname").getTemp();

				let res = await db.collection(tempEvent, tempUser).get();
				console.log(res);

				this.event = res.result.data[0];

				if (this.event.images) {
					this.images = await getTempFileURL(this.event.images);
				}

				if (this.event.location) {
					this.location.longitude = this.event.location.coordinates[0];
					this.location.latitude = this.event.location.coordinates[1];
				}

				this.updateViewCount();
			}
		},
		onPageScroll(e) {
			uni.$emit("onPageScroll", e.scrollTop);
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

			.title {
				font-size: 36rpx;
				font-weight: bold;
				color: #333;
				margin: 20rpx 0;
			}

			.date {
				font-size: 28rpx;
				color: #333;
				margin-top: 25rpx;
			}

			.deadline {
				font-size: 24rpx;
				color: #333;
				margin-top: 25rpx;
			}

			.region {
				font-size: 24rpx;
				color: #666;
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
				margin: 30rpx 0;
			}

			.media {
				margin-top: 25rpx;

				.image {
					width: 100%;
					background: #eee;
					border-radius: 15rpx;
					box-sizing: border-box;
					vertical-align: bottom;

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
				margin-top: 25rpx;
			}
		}

		.user-list {
			.user {
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
			}
		}
	}
</style>