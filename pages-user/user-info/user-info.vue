<template>
	<nav-bar></nav-bar>
	<safe-area></safe-area>

	<view class="container">
		<view class="group">
			<button class="item-wrap" open-type="chooseAvatar" @chooseavatar="chooseAvatar">
				<text class="title">头像</text>
				<view class="value-wrap">
					<cloud-file :src="userInfo" width="60rpx" height="60rpx" borderRadius="50%"
						border="1px solid #eee"></cloud-file>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</button>

			<view class="item-wrap" @click="setNickname">
				<text class="title">昵称</text>
				<view class="value-wrap">
					<view class="value">
						<name-init :data="userInfo"></name-init>
					</view>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
		</view>

		<view class="group" @click="toUserIntro">
			<view class="item-wrap">
				<text class="title">简介</text>
				<view class="value-wrap">
					<text class="value">{{userInfo.intro ? "" : "填写简介"}}</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
			<view v-if="userInfo.intro" class="desc">
				<text>{{userInfo.intro}}</text>
			</view>
		</view>

		<view class="group">
			<view class="item-wrap" @click="editGender">
				<text class="title">性别</text>
				<view class="value-wrap">
					<text
						class="value">{{userInfo.gender ? (userInfo.gender == 0 ? "未知" : userInfo.gender == 1 ? "男" : "女") : "未知"}}</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>

			<view class="item-wrap" @click="editBirthDate">
				<text class="title">生日</text>
				<view class="value-wrap">
					<view v-if="userInfo.birth_date" class="value">
						<uni-dateformat :date="userInfo.birth_date" format="yyyy/MM/dd"></uni-dateformat>
					</view>
					<text v-else class="value">未知</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>

			<view class="item-wrap" @click="editHometown">
				<text class="title">家乡</text>
				<view class="value-wrap">
					<text v-if="userInfo.hometown" class="value">{{userInfo.hometown.province}} {{userInfo.hometown.city}}
						{{userInfo.hometown.district}}</text>
					<text v-else class="value">选择家乡</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
		</view>

		<view class="group">
			<view class="item-wrap" @click="editRegion">
				<text class="title">所在地区</text>
				<view class="value-wrap">
					<text v-if="userInfo.region" class="value">{{userInfo.region.province}} {{userInfo.region.city}}
						{{userInfo.region.district}}</text>
					<text v-else class="value">选择所在地区</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
			<view class="item-wrap" @click="editStatus">
				<text class="title">状态</text>
				<view class="value-wrap">
					<text v-if="userInfo.status_name" class="value">{{userInfo.status_name}}</text>
					<text v-else class="value">选择工作状态</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
		</view>

		<view class="group">
			<view class="item-wrap" @click="editEmotion">
				<text class="title">情感</text>
				<view class="value-wrap">
					<text v-if="userInfo.emotion_name" class="value">{{userInfo.emotion_name}}</text>
					<text v-else class="value">选择情感状态</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>

			<view v-if="userInfo.emotion_id && userInfo.emotion_id == 6" class="item-wrap" @click="editLover">
				<text class="title">关联恋人</text>
				<view class="value-wrap">
					<text class="value">ZHEN</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
		</view>

		<view class="button" @click="logout">退出登录</view>

		<view class="note">松花酿酒，春水煎茶。</view>
	</view>

	<toast ref="toast"></toast>

	<popup ref="popup"></popup>
</template>

<script>
	import {
		store,
		mutations
	} from "@/uni_modules/uni-id-pages/common/store.js";

	import {
		getDistrict
	} from "@/common/request.js";

	const db = uniCloud.database();

	export default {
		data() {
			return {
				statusList: [{
						id: 0,
						name: "未知"
					},
					{
						id: 1,
						name: "大学在读"
					},
					{
						id: 2,
						name: "搬砖研究僧"
					},
					{
						id: 3,
						name: "攻读博士"
					},
					{
						id: 4,
						name: "在职打工"
					},
					{
						id: 5,
						name: "离职待业"
					},
					{
						id: 6,
						name: "自由职业"
					},
					{
						id: 7,
						name: "创业中"
					},
					{
						id: 8,
						name: "蒸蒸日上"
					}
				],
				emotionList: [{
						id: 0,
						name: "未知"
					},
					{
						id: 1,
						name: "母胎单身"
					},
					{
						id: 2,
						name: "等风来"
					},
					{
						id: 3,
						name: "自由可撩"
					},
					{
						id: 4,
						name: "单身贵族"
					},
					{
						id: 5,
						name: "心里有人"
					},
					{
						id: 6,
						name: "恋爱中"
					},
					{
						id: 7,
						name: "一言难尽"
					}
				],
				genderList: [{
						id: 0,
						name: "未知"
					},
					{
						id: 1,
						name: "男"
					},
					{
						id: 2,
						name: "女"
					}
				]
			};
		},
		onLoad() {},
		computed: {
			hasLogin() {
				return store.hasLogin
			},
			userInfo() {
				return store.userInfo
			}
		},
		methods: {
			editLover() {
				uni.navigateTo({
					url: "/pages-user/user-info/user-relationship/user-relationship"
				});
			},
			editStatus() {
				this.statusList.forEach(item => {
					if (this.userInfo.status_id ? item.id == this.userInfo.status_id : item.id == 0) {
						item.checked = true;
					}
				});

				this.$refs.popup.show({
					size: "medium",
					type: "checkbox",
					title: "选择工作状态",
					checks: this.statusList,
					success: (res) => {
						// console.log(res);
						let status_id = res.id;
						let status_name = res.name;

						if (status_id != this.userInfo.status_id) {
							try {
								this.$refs.toast.show({
									type: "loading",
									text: "正在更新",
									duration: "none"
								});

								mutations.updateUserInfo({
									status_id,
									status_name
								});

								this.$refs.toast.show({
									type: "success",
									text: "更新成功",
									duration: "2000"
								});
							} catch (err) {
								console.log(err);
							}
						}

						setTimeout(() => {
							this.$refs.popup.hide();
						}, 200);
					}
				});
			},
			editEmotion() {
				this.emotionList.forEach(item => {
					if (this.userInfo.emotion_id ? item.id == this.userInfo.emotion_id : item.id == 0) {
						item.checked = true;
					}
				});

				this.$refs.popup.show({
					size: "medium",
					type: "checkbox",
					title: "选择情感状态",
					checks: this.emotionList,
					success: (res) => {
						let emotion_id = res.id;
						let emotion_name = res.name;

						if (emotion_id != this.userInfo.emotion_id) {
							try {
								this.$refs.toast.show({
									type: "loading",
									text: "正在更新",
									duration: "none"
								});

								mutations.updateUserInfo({
									emotion_id,
									emotion_name
								});

								this.$refs.toast.show({
									type: "success",
									text: "更新成功",
									duration: "2000"
								});
							} catch (err) {
								console.log(err);
							}
						}

						setTimeout(() => {
							this.$refs.popup.hide();
						}, 200);
					}
				})
			},
			editRegion() {
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
								province: res[0],
								city: res[1],
								district: res[2],
								adcode: res[3]
							}
						} else {
							data = res;
						}

						try {
							this.$refs.toast.show({
								type: "loading",
								text: "正在更新",
								duration: "none"
							});

							let cityRes = await getDistrict(data.city);

							let distRes;
							cityRes.districts.forEach(item => {
								if (item.name == data.district) {
									distRes = item;
								}
							});

							console.log(cityRes, distRes);

							let cityCenter = cityRes.center.split(",");
							let distCenter = distRes.center.split(",");

							mutations.updateUserInfo({
								region: data,
								city: data.city,
								city_lng: Number(cityCenter[0]),
								city_lat: Number(cityCenter[1]),
								district: data.district,
								district_lng: Number(distCenter[0]),
								district_lat: Number(distCenter[1])
							});

							this.$refs.toast.show({
								type: "success",
								text: "更新成功",
								duration: "2000"
							});
						} catch (err) {
							console.log(err);
						}

						this.$refs.popup.hide();
					}
				});
			},
			editHometown() {
				this.$refs.popup.show({
					size: "medium",
					type: "picker",
					title: "选择家乡",
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
					success: res => {
						console.log(res);
						let data;
						if (Array.isArray(res)) {
							data = {
								province: res[0],
								city: res[1],
								district: res[2],
								adcode: res[3]
							}
						} else {
							data = res;
						}

						try {
							this.$refs.toast.show({
								type: "loading",
								text: "正在更新",
								duration: "none"
							});

							mutations.updateUserInfo({
								hometown: data
							});

							this.$refs.toast.show({
								type: "success",
								text: "更新成功",
								duration: "2000"
							});
						} catch (err) {
							console.log(err);
						}

						this.$refs.popup.hide();
					}
				});
			},
			editBirthDate() {
				// 回选
				let dateValue = [82, 0, 0];
				let birthDate = this.userInfo.birth_date;

				if (birthDate) {
					let date = new Date(birthDate);
					let y = date.getFullYear();
					let m = date.getMonth();
					let d = date.getDate();

					dateValue = [y - 1916, m, d - 1];
				}

				this.$refs.popup.show({
					size: "medium",
					type: "date",
					title: "选择生日",
					dateIn: {
						value: dateValue,
						cols: ["year", "month", "day"],
					},
					disabledTouch: true,
					success: res => {
						console.log(res);
						let birth_date = res.timestamp;

						if (birth_date != birthDate) {
							try {
								this.$refs.toast.show({
									type: "loading",
									text: "正在更新",
									duration: "none"
								});

								mutations.updateUserInfo({
									birth_date
								});

								this.$refs.toast.show({
									type: "success",
									text: "更新成功",
									duration: "2000"
								});
							} catch (err) {
								console.log(err);
							};
						}

						this.$refs.popup.hide();
					}
				});
			},
			editGender() {
				this.genderList.forEach(item => {
					if (this.userInfo.gender ? item.id == this.userInfo.gender : item.id == 0) {
						item.checked = true;
					}
				});

				this.$refs.popup.show({
					size: "small",
					type: "checkbox",
					title: "选择性别",
					checks: this.genderList,
					success: res => {
						let gender = res.id;

						if (gender != this.userInfo.gender) {
							try {
								this.$refs.toast.show({
									type: "loading",
									text: "正在更新",
									duration: "none"
								});

								mutations.updateUserInfo({
									gender
								});

								this.$refs.toast.show({
									type: "success",
									text: "更新成功",
									duration: "2000"
								});
							} catch (err) {
								console.log(err);
							};
						}

						setTimeout(() => {
							this.$refs.popup.hide();
						}, 200);
					}
				});
			},
			toUserIntro() {
				uni.navigateTo({
					url: "/pages-user/user-info/user-intro/user-intro"
				});
			},
			setNickname() {
				this.$refs.popup.show({
					size: "medium",
					type: "input",
					title: "编辑昵称",
					inputIn: {
						placeholder: "输入昵称",
						value: this.userInfo.nickname
					},
					success: res => {
						let nickname = res;

						if (nickname && nickname != this.userInfo.nickname) {
							try {
								mutations.updateUserInfo({
									nickname
								});

								this.$refs.toast.show({
									type: "success",
									text: "更新成功",
									duration: "2000"
								});
							} catch (err) {
								console.log(err);
							}
						}

						this.$refs.popup.hide();
					}
				});
			},
			async chooseAvatar(res) {
				let avatarUrl = res.detail.avatarUrl;
				let cloudPath = "users/avatars/" + this.userInfo._id + "_" + Date.now() + "." + avatarUrl.split(".")
					.pop().toLowerCase();
				let avatar_file = {
					extname: avatarUrl.split(".")[avatarUrl.split(".").length - 1],
					name: cloudPath,
					url: ""
				};

				try {
					this.$refs.toast.show({
						type: "loading",
						text: "更新中",
						duration: "none"
					});

					let {
						fileID
					} = await uniCloud.uploadFile({
						filePath: avatarUrl,
						cloudPath,
						fileType: "image"
					});

					avatar_file.url = fileID;

					mutations.updateUserInfo({
						avatar_file
					});

					this.$refs.toast.show({
						type: "success",
						content: "更新成功",
						duration: "2000"
					});
				} catch (err) {
					console.error(err);
				}
			},
			logout() {
				this.$refs.popup.show({
					size: "small",
					type: "text",
					title: "退出登录",
					text: "你确定要退出登录吗？",
					success: () => {
						mutations.logout();
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

			button {
				all: unset;
				box-sizing: border-box;

				&::after {
					display: none;
				}
			}

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
					flex: 0 0 150rpx;
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

		.note {
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 24rpx;
			opacity: 0.3;
			margin-bottom: 80rpx;
		}
	}
</style>