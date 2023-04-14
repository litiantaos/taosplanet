<template>
	<view class="container">
		<view class="group">
			<view class="item-wrap" @click="editTitle">
				<text class="title">活动主题</text>
				<view class="value-wrap">
					<text class="value">{{data.title || "输入主题"}}</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
			<view class="item-wrap" @click="editStartTime">
				<text class="title">开始时间</text>
				<view class="value-wrap">
					<view v-if="data.start_date" class="value">
						<uni-dateformat :date="data.start_date" format="yyyy/MM/dd hh:mm"></uni-dateformat>
					</view>
					<text v-else class="value">选择开始时间</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
			<view class="item-wrap" @click="editEndTime">
				<text class="title">结束时间</text>
				<view class="value-wrap">
					<view v-if="data.end_date" class="value">
						<uni-dateformat :date="data.end_date" format="yyyy/MM/dd hh:mm"></uni-dateformat>
					</view>
					<text v-else class="value">选择结束时间</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
			<view class="item-wrap" @click="editDeadline">
				<text class="title">报名截止时间</text>
				<view class="value-wrap">
					<view v-if="data.deadline" class="value">
						<uni-dateformat :date="data.deadline" format="yyyy/MM/dd hh:mm"></uni-dateformat>
					</view>
					<text v-else class="value">选择时间</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
		</view>

		<view class="group">
			<view class="item-wrap" @click="editCount">
				<text class="title">参与人数</text>
				<view class="value-wrap">
					<text class="value">{{data.limited_participant_count || "输入数量"}}</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
			<view class="item-wrap" @click="chooseRegion">
				<text class="title">活动地区</text>
				<view class="value-wrap">
					<text v-if="data.region" class="value">{{data.region.province}} {{data.region.city}}
						{{data.region.district}}</text>
					<text v-else class="value">选择地区</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
			<view v-if="data.region" class="item-wrap" @click="chooseLocation">
				<text class="title">活动地点</text>
				<view class="value-wrap">
					<text class="value">{{data.location_name || "选择地点"}}</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
		</view>

		<view class="group" @click="toEventIntro">
			<view class="item-wrap">
				<text class="title">活动说明</text>
				<view class="value-wrap">
					<text class="value">{{data.intro ? "" : "填写说明"}}</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
			<view v-if="data.intro" class="desc">
				<text>{{data.intro}}</text>
			</view>
		</view>

		<view class="group" @click="chooseImage">
			<view class="item-wrap">
				<text class="title">添加图片</text>
				<view class="value-wrap">
					<text class="value">{{tempImagePaths.length ? "" : "选择图片"}}</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>

			<view v-if="tempImagePaths.length" class="media">
				<scroll-view-pro :list="tempImagePaths" v-slot="{item, index}" horiMargin="25rpx">
					<view class="image-wrap">
						<image class="image" :src="item" mode="aspectFill" @click="previewImage(index)"></image>
						<view class="iconfont icon-close-circle-fill delete-btn" @click="removeImage(index)"></view>
					</view>
				</scroll-view-pro>
			</view>
		</view>

		<view class="button" @click="onConfirm">发布活动</view>
	</view>

	<toast ref="toast"></toast>
	<popup ref="popup"></popup>
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

	export default {
		data() {
			return {
				data: {},
				tempImagePaths: []
			};
		},
		onUnload() {
			uni.removeStorageSync("event-intro");
		},
		computed: {
			userInfo() {
				return store.userInfo;
			}
		},
		methods: {
			async addData() {
				await checkContent(this.data.title).then(res => {
					console.log(res);
					if (res == 1) {
						this.data.sec_check = 1;
					}
				});

				await checkContent(this.data.intro).then(res => {
					console.log(res);
					if (res == 1) {
						this.data.sec_check = 1;
					}
				});

				if (this.data.images?.length) {
					this.data.images.map(async item => {
						await checkMedia(item).then(res => {
							console.log(res);
							if (res == 1) {
								data.sec_check = 1;
								return;
							}
						});
					});
				}

				db.collection("db-events").add(this.data).then(res => {
					console.log("addData", res);
					if (this.data.sec_check && this.data.sec_check == 1) {
						this.$refs.toast.show({
							type: "error",
							text: "内容违规，待人工审核",
							duration: "2000"
						});
					} else {
						// 创建人加入参与者表
						db.collection("db-events-participants").add({
							event_id: res.result.id,
							is_creator: true
						}).then(() => {
							this.$refs.toast.show({
								type: "success",
								text: "发布成功",
								duration: "2000"
							});
						});
					}

					setTimeout(() => {
						uni.reLaunch({
							url: "/pages-fun/event/event"
						});
					}, 1000);
				});
			},
			onConfirm: throttle(async function() {
				if (!this.data.title) {
					this.$refs.toast.show({
						type: "info",
						text: "请填写主题",
						duration: "2000"
					});
					return;
				}

				if (!this.data.start_date) {
					this.$refs.toast.show({
						type: "info",
						text: "请选择开始时间",
						duration: "2000"
					});
					return;
				}

				if (!this.data.deadline) {
					this.$refs.toast.show({
						type: "info",
						text: "请选择截止时间",
						duration: "2000"
					});
					return;
				}

				if (!this.data.region) {
					this.$refs.toast.show({
						type: "info",
						text: "请选择地区",
						duration: "2000"
					});
					return;
				}

				if (!this.data.intro) {
					this.$refs.toast.show({
						type: "info",
						text: "请填写说明",
						duration: "2000"
					});
					return;
				}

				this.$refs.toast.show({
					type: "loading",
					text: "发布中",
					duration: "none"
				});

				if (this.tempImagePaths.length) {
					let fileIdList = await uploadFile({
						tempPaths: this.tempImagePaths,
						path: "events/images/",
						user_id: this.userInfo._id
					});

					this.data.images = fileIdList;
				}

				this.addData();
			}),

			chooseImage() {
				uni.chooseMedia({
					mediaType: ["image"],
					success: res => {
						// console.log(res);

						let tempFilePaths = res.tempFiles.map(item => {
							return item.tempFilePath
						});

						let arr = [...this.tempImagePaths, ...tempFilePaths];
						arr = arr.slice(0, 9);
						this.tempImagePaths = arr;
					}
				});
			},
			removeImage(index) {
				this.tempImagePaths.splice(index, 1);
			},
			previewImage(index) {
				uni.previewImage({
					current: index,
					urls: this.tempImagePaths
				});
			},
			chooseLocation() {
				let actions = [{
					text: "待定"
				}, {
					text: "选择位置"
				}];

				this.$refs.popup.show({
					size: "small",
					type: "action",
					title: "操作",
					actions: actions,
					success: index => {
						if (index == 0) {
							this.$refs.popup.hide();
							if (this.data.location) {
								delete this.data.location;
							}
							this.data.location_name = "待定";
						} else if (index == 1) {
							this.$refs.popup.hide();
							uni.chooseLocation({
								success: res => {
									console.log(res);
									this.data.location_name = res.name;
									this.data.location = {
										type: "Point",
										coordinates: [
											res.longitude,
											res.latitude
										]
									};
								}
							});
						}
					}
				});
			},
			chooseRegion() {
				this.$refs.popup.show({
					size: "medium",
					type: "picker",
					title: "选择地区",
					pickerIn: {
						tabs: ["中国"],
						levels: 3,
						col: "opendb-city-china",
						levelField: "type",
						parentField: "parent_code",
						field: "_id, code, name, type",
						orderBy: "code"
					},
					pickerHeight: "calc(100% - 190rpx)",
					showLocation: true,
					success: async res => {
						// console.log(res);
						let data;
						if (Array.isArray(res)) {
							data = {
								province: res[0].name,
								city: res[1].name,
								district: res[2].name,
								adcode: res[2].code
							}
						} else {
							data = res;
						}

						this.data.region = data;

						this.$refs.popup.hide();
					}
				});
			},
			editCount() {
				this.$refs.popup.show({
					size: "medium",
					type: "input",
					title: "输入参与人数",
					inputIn: {
						placeholder: "输入数量",
						value: this.data.limited_participant_count || 0,
						type: "number"
					},
					success: res => {
						let count = parseInt(res);
						this.data.limited_participant_count = count;
						this.$refs.popup.hide();
					}
				});
			},
			toEventIntro() {
				let data = this.data.intro || "";
				uni.setStorageSync("event-intro", data);
				uni.navigateTo({
					url: "/pages-fun/event/event-create/event-intro/event-intro"
				});
			},
			editDeadline() {
				// 回选
				let ndate = new Date();
				let dateValue = [ndate.getFullYear() - 1916, ndate.getMonth(), ndate.getDate() - 1, 12, 30];
				let deadline = this.data.deadline;

				if (deadline) {
					let date = new Date(deadline);
					let y = date.getFullYear();
					let M = date.getMonth();
					let d = date.getDate();
					let h = date.getHours();
					let m = date.getMinutes();

					dateValue = [y - 1916, M, d - 1, h, m];
				}

				this.$refs.popup.show({
					size: "medium",
					type: "date",
					title: "选择截止时间",
					dateIn: {
						value: dateValue,
						cols: ["year", "month", "day", "hour", "minute"],
					},
					disabledTouch: true,
					success: res => {
						// console.log(res);
						this.data.deadline = res.timestamp;
						this.$refs.popup.hide();
					}
				});
			},
			editEndTime() {
				// 回选
				let ndate = new Date();
				let dateValue = [ndate.getFullYear() - 1916, ndate.getMonth(), ndate.getDate() - 1, 12, 30];
				let endDate = this.data.end_date;

				if (endDate) {
					let date = new Date(endDate);
					let y = date.getFullYear();
					let M = date.getMonth();
					let d = date.getDate();
					let h = date.getHours();
					let m = date.getMinutes();

					dateValue = [y - 1916, M, d - 1, h, m];
				}

				this.$refs.popup.show({
					size: "medium",
					type: "date",
					title: "选择结束时间",
					dateIn: {
						value: dateValue,
						cols: ["year", "month", "day", "hour", "minute"],
					},
					disabledTouch: true,
					success: res => {
						// console.log(res);
						this.data.end_date = res.timestamp;
						this.$refs.popup.hide();
					}
				});
			},
			editStartTime() {
				// 回选
				let ndate = new Date();
				let dateValue = [ndate.getFullYear() - 1916, ndate.getMonth(), ndate.getDate() - 1, 12, 30];
				let startDate = this.data.start_date;

				if (startDate) {
					let date = new Date(startDate);
					let y = date.getFullYear();
					let M = date.getMonth();
					let d = date.getDate();
					let h = date.getHours();
					let m = date.getMinutes();

					dateValue = [y - 1916, M, d - 1, h, m];
				}

				this.$refs.popup.show({
					size: "medium",
					type: "date",
					title: "选择开始时间",
					dateIn: {
						value: dateValue,
						cols: ["year", "month", "day", "hour", "minute"],
					},
					disabledTouch: true,
					success: res => {
						// console.log(res);
						this.data.start_date = res.timestamp;
						this.$refs.popup.hide();
					}
				});
			},
			editTitle() {
				this.$refs.popup.show({
					size: "medium",
					type: "input",
					title: "编辑主题",
					inputIn: {
						placeholder: "输入活动主题",
						value: this.data.title || ""
					},
					success: res => {
						this.data.title = res;

						this.$refs.popup.hide();
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		padding: 25rpx;

		.group {
			border-radius: 20rpx;
			overflow: hidden;
			margin-bottom: 20rpx;

			.item-wrap {
				height: 120rpx;
				padding: 25rpx;
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
					font-weight: bold;
					flex: 0 0 200rpx;
				}

				.value-wrap {
					display: flex;
					justify-content: flex-end;
					align-items: center;

					.value {
						font-size: 28rpx;
						color: #666;
					}

					.iconfont {
						font-size: 30rpx;
						font-weight: bold;
						line-height: 100%;
						margin-left: 20rpx;
					}
				}
			}

			.desc {
				padding: 0 25rpx 25rpx;
				background: #fff;
				font-size: 28rpx;
				color: #999;
				line-height: 50rpx;
			}

			.media {
				background: #fff;
				padding-bottom: 25rpx;

				.image-wrap {
					position: relative;
				}

				.image {
					width: 200rpx;
					height: 200rpx;
					background: #eee;
					border: 1px solid #eee;
					border-radius: 15rpx;
					box-sizing: border-box;
					vertical-align: bottom;
				}

				.delete-btn {
					position: absolute;
					top: 10rpx;
					right: 10rpx;
					font-size: 36rpx;
					color: #fff;
					opacity: 0.6;
				}
			}
		}

		.button {
			height: 100rpx;
			background: #333;
			border-radius: 20rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			color: #fff;
			font-size: 28rpx;
			margin: 80rpx 0;
			transition: opacity .2s;

			&:active {
				opacity: 0.8;
			}
		}
	}
</style>