<template>
	<view class="container">
		<view class="title-wrap">
			<view class="title">{{data.title}}</view>
			<view class="iconfont icon-more-circle" @click="clickMore"></view>
		</view>
		<view class="items">
			<view class="item">学历{{data.education_name}}</view>
			<view class="item">经验{{data.experience_name}}</view>
			<view class="item">{{data.salary_min}}K-{{data.salary_max}}K·{{data.salary_num}}薪</view>
		</view>

		<view v-if="data.user_id" class="user" @click="toUserDetail">
			<cloud-file :src="data.user_id[0]" width="80rpx" height="80rpx" borderRadius="50%"></cloud-file>
			<view class="right">
				<view class="username">{{data.user_id[0].nickname}}</view>
				<view class="project">{{data.project_id[0].title}}</view>
			</view>
		</view>

		<view class="description">
			<view class="subtitle">职位描述</view>
			<view class="text">
				<text>{{data.description}}</text>
			</view>
		</view>
	</view>

	<popup ref="popup"></popup>
	<toast ref="toast"></toast>
	<tooltip ref="tooltip"></tooltip>
</template>

<script>
	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

	const db = uniCloud.database();

	export default {
		data() {
			return {
				positionId: "",
				data: {}
			};
		},
		onLoad(e) {
			this.positionId = e.id;
			this.getPosition();
			// console.log(e);
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

				if (store.hasLogin && store.userInfo._id == this.data.user_id[0]._id) {
					actions.push({
						text: "编辑",
						icon: "icon-edit",
					}, {
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
							this.$refs.popup.hide();
							// uni.navigateTo({
							// 	url: "/pages-fun/event/event-share/event-share"
							// });
						} else if (index == 1) {
							this.$refs.tooltip.show();
						} else if (index == 2) {
							this.$refs.popup.hide();
							uni.navigateTo({
								url: "/pages-project/position/position-create/position-create?positionId=" + this.positionId
							});
						} else if (index == 3) {
							this.deletePosition();
						}
					}
				});
			},
			deletePosition() {
				this.$refs.popup.show({
					type: "text",
					title: "提示",
					text: "确定要删除本职位吗？",
					success: () => {
						this.$refs.toast.show({
							type: "loading",
							text: "正在删除",
							duration: "none"
						});

						db.collection("db-positions").doc(this.positionId).remove().then(res => {
							this.$refs.toast.show({
								type: "success",
								text: "删除成功",
								duration: "2000"
							});

							setTimeout(() => {
								let pages = getCurrentPages();
								let prevPage = pages[pages.length - 2];

								prevPage.$vm.getPositions();

								uni.navigateBack();
							}, 1000)
						});
					}
				});
			},
			toUserDetail() {
				uni.navigateTo({
					url: "/pages-user/user-detail/user-detail?id=" + this.data.user_id[0]._id
				});
			},
			async getPosition() {
				let tempPosition = await db.collection("db-positions").where(`_id == "${this.positionId}"`).getTemp();
				let tempUser = await db.collection("uni-id-users").field("_id, avatar_file, nickname").getTemp();
				let tempProject = await db.collection("db-projects").field("_id, title").getTemp();

				let res = await db.collection(tempPosition, tempUser, tempProject).get();

				let resData = res.result.data[0];
				console.log(resData);
				this.data = resData;
			}
		},
		onShareAppMessage() {
			return {
				title: this.data.title,
				path: "/pages-project/position-detail/position-detail?id=" + this.data.project_id[0]._id
			}
		},
		onShareTimeline() {
			return {
				title: this.data.title,
				query: "from=timeline"
			}
		}
	}
</script>

<style>
	page {
		background: #fff;
	}
</style>

<style lang="scss" scoped>
	.container {
		padding: 25rpx;
	}

	.title-wrap {
		display: flex;
		justify-content: space-between;
		align-items: center;

		.title {
			font-size: 48rpx;
			font-weight: bold;
		}

		.iconfont {
			font-size: 42rpx;
			color: #666;
		}
	}

	.description {
		margin-top: 40rpx;
		background: #f5f5f5;
		border-radius: 20rpx;
		padding: 35rpx 25rpx;

		.subtitle {
			font-size: 32rpx;
			font-weight: bold;
			border-bottom: 1rpx solid #e5e5e5;
			padding-bottom: 25rpx;
		}

		.text {
			line-height: 1.8;
			font-size: 30rpx;
			color: #333;
			text-align: justify;
			margin-top: 25rpx;
		}
	}

	.items {
		display: flex;
		align-items: center;
		margin-top: 25rpx;

		.item {
			font-size: 24rpx;
			color: #666;
			margin-right: 20rpx;
			background: #f5f5f5;
			border-radius: 15rpx;
			padding: 10rpx 20rpx;
		}
	}

	.user {
		display: flex;
		align-items: center;
		padding: 25rpx;
		background: #f5f5f5;
		border-radius: 20rpx;
		margin-top: 40rpx;

		.right {
			margin-left: 25rpx;

			.username {
				font-size: 28rpx;
				font-weight: bold;
				color: #333;
			}

			.project {
				font-size: 24rpx;
				color: #666;
			}
		}
	}
</style>