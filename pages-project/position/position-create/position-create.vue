<template>
	<view class="container">
		<input class="input" type="text" placeholder="职位名称" @input="onInput" />
		<textarea class="textarea" placeholder="职位描述" @input="onTextarea"></textarea>
		<view class="fun-btn" @click="editEducation">
			<view class="">{{data.education_name ? data.education_name : "学历"}}</view>
			<i class="iconfont icon-arrow-right"></i>
		</view>
		<view class="fun-btn" @click="editExperience">
			<view class="">{{data.experience_name ? data.experience_name : "经验"}}</view>
			<i class="iconfont icon-arrow-right"></i>
		</view>

		<view class="salary">
			<view class="title">薪资</view>

			<view class="num-input-wrap">
				<input class="num-input" type="number" @input="onInputMin" />
				<view class="text">K -</view>
				<input class="num-input" type="number" @input="onInputMax" />
				<view class="text">K</view>
			</view>
			<view class="num-input-wrap">
				<input class="num-input" type="number" value="12" @input="onInputNum" />
				<view class="text">薪</view>
			</view>
		</view>

		<view class="warning">
			<view v-if="warningText" class="">{{warningText}}</view>
		</view>

		<view class="confirm-wrap">
			<view v-if="data.title && data.description && data.experience_name" class="confirm-btn iconfont icon-tick"
				@click="onConfirm"></view>
		</view>
	</view>

	<toast ref="toast"></toast>
	<popup ref="popup"></popup>
</template>

<script>
	import {
		throttle,
	} from "@/common/utils.js";

	const db = uniCloud.database();

	export default {
		data() {
			return {
				data: {},
				warningText: "",
				projectId: ""
			};
		},
		onLoad(e) {
			this.projectId = e.id;
			console.log(this.projectId);
		},
		methods: {
			onConfirm: throttle(async function() {
				console.log(this.data);
				this.data.project_id = this.projectId;
				if (!this.data.salary_num) {
					this.data.salary_num = 12;
				}
				if (this.data.salary_min & this.data.salary_max && this.data.salary_min > this.data.salary_max) {
					this.warningText = "薪资数值有误";
					return;
				} else {
					this.warningText = "";
				}

				db.collection("db-positions").add(this.data).then(res => {
					this.$refs.toast.show({
						type: "success",
						text: "提交成功",
						duration: "2000"
					});

					setTimeout(() => {
						let pages = getCurrentPages();
						let prevPage = pages[pages.length - 2];

						prevPage.$vm.getPositions();

						uni.navigateBack();
					}, 1000);
				});
			}),
			onInputMin(e) {
				let val = Number(e.detail.value);
				this.data.salary_min = val;
			},
			onInputMax(e) {
				let val = Number(e.detail.value);
				this.data.salary_max = val;
			},
			onInputNum(e) {
				let val = Number(e.detail.value);
				this.data.salary_num = val;
			},
			editExperience() {
				const list = [{
						id: 0,
						name: "不限",
					},
					{
						id: 1,
						name: "1年以内",
					},
					{
						id: 2,
						name: "1-3年",
					},
					{
						id: 3,
						name: "3-5年",
					},
					{
						id: 4,
						name: "5-10年"
					},
					{
						id: 5,
						name: "10年以上"
					}
				];

				this.$refs.popup.show({
					size: "medium",
					type: "checkbox",
					title: "选择经验",
					checks: list,
					success: res => {
						console.log(res);
						this.data.experience_id = res.id;
						this.data.experience_name = res.name;

						setTimeout(() => {
							this.$refs.popup.hide();
						}, 200);
					}
				});
			},
			editEducation() {
				const list = [{
						id: 0,
						name: "不限",
					},
					{
						id: 1,
						name: "专科及以上",
					},
					{
						id: 2,
						name: "本科及以上",
					},
					{
						id: 3,
						name: "硕士及以上",
					},
					{
						id: 4,
						name: "博士"
					}
				];

				this.$refs.popup.show({
					size: "medium",
					type: "checkbox",
					title: "选择学历",
					checks: list,
					success: res => {
						console.log(res);
						this.data.education_id = res.id;
						this.data.education_name = res.name;

						setTimeout(() => {
							this.$refs.popup.hide();
						}, 200);
					}
				});
			},
			onInput(e) {
				this.data.title = e.detail.value;
			},
			onTextarea(e) {
				this.data.description = e.detail.value;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		padding: 25rpx;

		.input {
			height: 100rpx;
			border-bottom: 2rpx solid #eee;
		}

		.textarea {
			width: 100%;
			height: 500rpx;
			padding: 20rpx 0;
			margin-top: 25rpx;
		}
	}

	.fun-btn {
		color: #666;
		height: 100rpx;
		width: fit-content;
		display: flex;
		align-items: center;
		margin-top: 25rpx;

		.iconfont {
			margin-left: 15rpx;
		}
	}

	.confirm-wrap {
		height: 200rpx;
		display: flex;
		justify-content: center;
		align-items: center;

		.confirm-btn {
			width: 90rpx;
			height: 90rpx;
			background: #333;
			border-radius: 50%;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 36rpx;
			color: #fff;
			line-height: 100%;
		}
	}

	.salary {
		display: flex;
		align-items: center;
		height: 100rpx;
		margin-top: 25rpx;

		.title {
			color: #666;
			margin-right: 80rpx;
		}

		.num-input-wrap {
			height: 60rpx;
			background: #eee;
			border-radius: 15rpx;
			overflow: hidden;
			display: flex;
			align-items: center;
			margin-right: 20rpx;
			padding-right: 25rpx;

			.num-input {
				width: 100rpx;
				height: 100%;
				text-align: center;
				color: #666;
				font-size: 28rpx;
				padding: 0 15rpx;
			}

			.text {
				color: #999;
				font-size: 26rpx;
			}
		}
	}

	.warning {
		color: indianred;
		font-size: 24rpx;
		height: 100rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>