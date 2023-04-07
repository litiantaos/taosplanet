<template>
	<nav-bar></nav-bar>
	<safe-area></safe-area>

	<view class="container">
		<view class="group">
			<view class="item-wrap" @click="editCollege">
				<text class="title">学校</text>
				<view class="value-wrap">
					<text v-if="data.college_name" class="value">{{data.college_name}}</text>
					<text v-else class="value">选择学校</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>

			<view class="item-wrap" @click="editMajor">
				<text class="title">专业</text>
				<view class="value-wrap">
					<text v-if="data.major" class="value">{{data.major}}</text>
					<text v-else class="value">输入专业</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>

			<view class="item-wrap" @click="editTime">
				<text class="title">时间</text>
				<view class="value-wrap">
					<text v-if="data.start_date || data.end_date" class="value">{{data.start_date}}-{{data.end_date}}</text>
					<text v-else class="value">选择时间</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>
		</view>

		<view v-if="type == 'update'" class="remove" @click="remove">
			<i class="iconfont icon-close-circle"></i>
			<text>删除本条记录</text>
		</view>

		<view class="button" @click="submit">保存</view>
	</view>

	<toast ref="toast"></toast>

	<popup ref="popup"></popup>
</template>

<script>
	const db = uniCloud.database();
	const utils = uniCloud.importObject("utils", {
		customUI: true
	});

	export default {
		data() {
			return {
				data: {},
				type: "",
				tempData: {}
			};
		},
		onLoad() {
			let data = uni.getStorageSync("user-college");

			if (data != '') {
				this.data = data;
				this.type = "update";
			} else {
				this.data = {};
				this.type = "add";
			}

			console.log(this.data);
		},
		onUnload() {
			uni.removeStorageSync("user-college");
		},
		methods: {
			after(e) {
				this.$refs.toast.show({
					type: "success",
					text: e,
					duration: "2000"
				});

				setTimeout(() => {
					let pages = getCurrentPages();
					let prevPage = pages[pages.length - 2];

					prevPage.$vm.getColleges();

					uni.navigateBack();
				}, 1000);
			},
			async submit() {
				if (Object.keys(this.tempData).length == 0) {
					this.$refs.toast.show({
						type: "info",
						text: "至少要选择学校哦",
						duration: "2000"
					});
					return;
				}

				this.$refs.toast.show({
					type: "loading",
					text: "更新中",
					duration: "none"
				});

				if (this.type == "add") {
					await db.collection("db-users-colleges").add(this.tempData);
					await utils.calc("db-colleges", "student_count", this.tempData.college_id, 1);
					this.after("新增成功");
				} else {
					await db.collection("db-users-colleges").where(`_id == "${this.data._id}"`).update(this.tempData);
					if (this.tempData.college_id && this.tempData.college_id != this.data.college_id) {
						await utils.calc("db-colleges", "student_count", this.tempData.college_id, 1);
					}
					this.after("更新成功");
				}
			},
			remove() {
				this.$refs.popup.show({
					size: "small",
					type: "text",
					title: "提示",
					text: "你确定要删除本记录吗？",
					success: async () => {
						this.$refs.toast.show({
							type: "loading",
							text: "删除中",
							duration: "none"
						});

						await db.collection("db-users-colleges").where(`_id == "${this.data._id}"`).remove();
						await utils.calc("db-colleges", "student_count", this.data.college_id, -1);
						this.after("删除成功");
					}
				});
			},
			editTime() {
				this.$refs.popup.show({
					size: "medium",
					type: "date",
					title: "选择年份",
					dateIn: {
						value: [100, 104],
						cols: ["year", "year"],
					},
					disabledTouch: true,
					success: res => {
						this.data.start_date = res.data[0];
						this.data.end_date = res.data[1];

						this.tempData.start_date = res.data[0];
						this.tempData.end_date = res.data[1];

						this.$refs.popup.hide();
					}
				});
			},
			editMajor() {
				this.$refs.popup.show({
					size: "medium",
					type: "input",
					title: "编辑专业",
					inputIn: {
						placeholder: "输入专业",
						value: this.data.major ? this.data.major : ""
					},
					success: res => {
						this.data.major = res;
						this.tempData.major = res;

						this.$refs.popup.hide();
					}
				});
			},
			editCollege() {
				uni.navigateTo({
					url: "/pages-user/user-college/college-select/college-select"
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
					flex: 0 0 150rpx;
				}

				.value-wrap {
					display: flex;
					justify-content: flex-end;
					align-items: center;

					.value {
						margin: 0 20rpx;
						font-size: 28rpx;
						color: #666;
					}

					.iconfont {
						font-size: 30rpx;
						font-weight: bold;
						line-height: 100%;
					}
				}
			}
		}

		.remove {
			font-size: 28rpx;
			color: #666;
			display: flex;
			justify-content: center;
			align-items: center;
			margin-top: 40rpx;

			.iconfont {
				margin-right: 20rpx;
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