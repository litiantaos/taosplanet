<template>
	<nav-bar></nav-bar>
	<safe-area></safe-area>

	<view class="container">
		<view class="group">
			<view class="item-wrap" @click="editTime">
				<text class="title">时间</text>
				<view class="value-wrap">
					<view v-if="data.start_date || data.end_date" class="value">
						<uni-dateformat :date="data.start_date" format="yyyy/MM"></uni-dateformat> -
						<uni-dateformat :date="data.end_date" format="yyyy/MM"></uni-dateformat>
					</view>
					<text v-else class="value">选择时间</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>

			<view class="item-wrap" @click="editCompany">
				<text class="title">公司</text>
				<view class="value-wrap">
					<text v-if="data.company" class="value">{{data.company}}</text>
					<text v-else class="value">输入公司名称</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>

			<view class="item-wrap" @click="editIndustry">
				<text class="title">行业</text>
				<view class="value-wrap">
					<text v-if="data.industry_name" class="value">{{data.industry_name}}</text>
					<text v-else class="value">选择行业</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>

			<view class="item-wrap" @click="editPosition">
				<text class="title">职务</text>
				<view class="value-wrap">
					<text v-if="data.position" class="value">{{data.position}}</text>
					<text v-else class="value">输入职务名称</text>
					<i class="iconfont icon-arrow-right"></i>
				</view>
			</view>

			<view class="item-wrap" @click="editDuties">
				<text class="title">职责</text>
				<view class="value-wrap">
					<text v-if="data.duties" class="value">{{data.duties}}</text>
					<text v-else class="value">输入主要职责</text>
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
				industries: [],
				data: {},
				type: "",
				tempData: {}
			};
		},
		onLoad() {
			let data = uni.getStorageSync("user-resume");

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
			uni.removeStorageSync("user-resume");
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

					prevPage.$vm.getResumes();

					uni.navigateBack();
				}, 1000);
			},
			async submit() {
				if (Object.keys(this.tempData).length == 0) {
					this.$refs.toast.show({
						type: "info",
						text: "不要留空哦",
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
					await db.collection("db-users-resumes").add(this.tempData);
					await utils.calc("db-industries", "user_count", this.tempData.industry_id, 1);
					this.after("新增成功");
				} else {
					await db.collection("db-users-resumes").where(`_id == "${this.data._id}"`).update(this.tempData);
					if (this.tempData.industry_id && this.tempData.industry_id != this.data.industry_id) {
						await utils.calc("db-industries", "user_count", this.tempData.industry_id, 1);
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

						await db.collection("db-users-resumes").where(`_id == "${this.data._id}"`).remove();
						await utils.calc("db-industries", "user_count", this.data.industry_id, -1);
						this.after("删除成功");
					}
				});
			},
			editDuties() {
				this.$refs.popup.show({
					size: "medium",
					type: "input",
					title: "主要职责",
					inputIn: {
						placeholder: "简要描述负责的事项",
						value: this.data.duties || "",
						maxlength: 30,
					},
					success: res => {
						this.data.duties = res;
						this.tempData.duties = res;

						this.$refs.popup.hide();
					}
				});
			},
			editPosition() {
				this.$refs.popup.show({
					size: "medium",
					type: "input",
					title: "职务名称",
					inputIn: {
						placeholder: "输入职务名称",
						value: this.data.position || ""
					},
					success: res => {
						this.data.position = res;
						this.tempData.position = res;

						this.$refs.popup.hide();
					}
				});
			},
			editIndustry() {
				let selectorIn = {
					tabs: ["全部"],
					levels: 2,
					db: {
						col: "industries",
						field: "_id, name, level, parent_id",
						orderBy: "number_of_users desc"
					}
				};

				this.$refs.popup.show({
					size: "medium",
					type: "picker",
					title: "选择行业",
					pickerIn: {
						tabs: ["全部"],
						levels: 2,
						col: "db-industries",
						levelField: "type",
						parentField: "parent_code",
						field: "_id, code, name, type",
						orderBy: "code"
					},
					success: (res) => {
						// console.log(res);
						this.data.industry_id = res[3];
						this.data.industry_name = res[1];

						this.tempData.industry_id = res[3];
						this.tempData.industry_name = res[1];

						this.$refs.popup.hide();
					}
				});
			},
			editCompany() {
				this.$refs.popup.show({
					size: "medium",
					type: "input",
					title: "公司名称",
					inputIn: {
						placeholder: "输入公司名称",
						value: this.data.company || ""
					},
					success: res => {
						this.data.company = res;
						this.tempData.company = res;

						this.$refs.popup.hide();
					}
				});
			},
			editTime() {
				this.$refs.popup.show({
					size: "medium",
					type: "date",
					title: "选择年份",
					dateIn: {
						value: [100, 0, 100, 0],
						cols: ["year", "month", "year", "month"],
					},
					disabledTouch: true,
					success: res => {
						this.data.start_date = res.timestamp[0];
						this.data.end_date = res.timestamp[1];

						this.tempData.start_date = res.timestamp[0];
						this.tempData.end_date = res.timestamp[1];

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