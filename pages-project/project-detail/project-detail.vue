<template>
	<view>
		<view class="container">
			<view class="title-wrap">
				<view class="title">{{data.title}}</view>
				<view class="iconfont icon-more-circle" @click="clickMore"></view>
			</view>
			<view class="info">
				<view v-if="data.user_id" class="user" @click="toUserDetail">
					<cloud-file :src="data.user_id[0]" width="50rpx" height="50rpx" borderRadius="50%"></cloud-file>
					<view class="username">{{data.user_id[0].nickname}}</view>
				</view>
				<view class="tag">{{data.industry_name}}</view>
			</view>

			<view v-if="positions.length > 0" class="recruit-banner" @click="toPosition">
				<view class="">项目正在招募伙伴</view>
				<view class="iconfont icon-arrow-circle-right-t"></view>
			</view>

			<view class="parse">
				<parse-pro :content="data.content" :tagStyle="style" selectable lazyLoad></parse-pro>
			</view>

			<view v-if="data.file" class="file-card" @click="openFile">
				<view class="left">{{data.file.ext}}</view>
				<view class="right">
					<view class="name">{{data.file.name}}</view>
					<view class="size">{{data.file.size}}</view>
				</view>
				<view class="text">{{fileStatus}}</view>
			</view>

		</view>

		<view class="footer">
			<view class="text">
				<text>{{data.is_modified ? "更新于 " : "发布于 "}}</text>
				<uni-dateformat :date="data.last_modify_date" format="M/d h:mm" :threshold="[60000, 3600000*24*30]">
				</uni-dateformat>
			</view>
		</view>

		<view class="anchor">
			<view style="height: 175rpx;"></view>
			<safe-area type="bottom"></safe-area>
		</view>

		<view class="next-page">
			<view class="inner">
				<view class="button" @click="onSupport">支持一下</view>
				<view v-if="data.investor_count > 0" class="investors">
					<view class="text">{{investorCount}}人已支持</view>
					<avatar-group :avatars="avatars" radius="50rpx"></avatar-group>
				</view>
			</view>
			<safe-area type="bottom"></safe-area>
		</view>
	</view>

	<load-view background="#fff" :isLoading="isLoading"></load-view>

	<popup ref="popup"></popup>
	<toast ref="toast"></toast>
	<tooltip ref="tooltip"></tooltip>

	<uni-pay ref="pay" @success="onPaySuccess"></uni-pay>
</template>

<script>
	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

	import {
		getTempFileURL,
		replaceImgSrc
	} from "@/common/cloud.js";

	import pagesJson from "@/pages.json";

	const db = uniCloud.database();
	const utils = uniCloud.importObject("utils", {
		customUI: true
	});

	export default {
		data() {
			return {
				projectId: "",
				data: {},
				style: {
					h2: "margin-bottom: 20rpx; font-size: 36rpx;",
					p: "line-height: 1.6;"
				},
				fileStatus: "查看文件",
				avatars: [],
				positions: [],
				amount: 0,
				isLoading: true,
				investorCount: 0
			};
		},
		onLoad(e) {
			this.projectId = e.id;

			this.getData();
		},
		computed: {
			userInfo() {
				return store.userInfo;
			}
		},
		methods: {
			shareProject() {
				this.$refs.popup.show({
					size: "large",
					type: "input",
					title: "转发到动态",
					inputIn: {
						placeholder: "说点什么吧～",
						textarea: true,
						maxlength: -1,
						style: "gray"
					},
					success: res => {
						console.log(res);
						this.$refs.toast.show({
							type: "loading",
							text: "发布中",
							duration: "none"
						});

						db.collection("db-posts").add({
							shared_project_id: this.projectId,
							content: res,
							topic_id: "b0cde5b0643041670008d3de77ffaecd"
						}).then(result => {
							this.$refs.toast.show({
								type: "success",
								text: "发布成功",
								duration: "2000"
							});

							setTimeout(() => {
								uni.reLaunch({
									url: "/pages/index/index"
								});
							}, 1000);
						});
					}
				});
			},
			toUserDetail() {
				uni.navigateTo({
					url: "/pages-user/user-detail/user-detail?id=" + this.data.user_id[0]._id
				});
			},
			updateViewCount() {
				utils.calc("db-projects", "view_count", this.projectId, 1).then(res => {
					// console.log(res);
				});
			},
			onPaySuccess(e) {
				console.log("pay success", e);
				this.getInvestors();

				this.$refs.popup.show({
					size: "medium",
					type: "text",
					title: "支付成功！",
					text: "感谢你的投资，投资款将在扣除微信手续费1%后进入项目发起人的账户，你可以在项目详情中看到项目的全部受资情况。",
					success: () => {
						this.$refs.popup.hide();
					}
				});

				db.collection("db-project-investment").add({
					project_id: this.projectId,
					amount: this.amount
				}).then(async res => {
					// console.log("pay success");
					let count = await db.collection("db-project-investment")
						.where(`project_id == "${this.projectId}" && user_id == $cloudEnv_uid`).count();
					if (count.result.total == 0) {
						utils.calc("db-projects", "investor_count", this.projectId, 1);
					}
					utils.calc("db-projects", "total_investment", this.projectId, this.amount);
				});
			},
			onPay(fee) {
				let order_no = `PROJECT_INVESTMENT_` + Date.now();

				this.$refs.pay.open({
					total_fee: fee,
					order_no: order_no,
					type: "test",
					description: "project investment"
				});
			},
			onSupport() {
				this.$refs.popup.show({
					size: "medium",
					type: "input",
					title: "支持金额",
					inputIn: {
						placeholder: "输入金额",
						type: "digit",
						value: 5
					},
					success: res => {
						this.amount = res - this.round(res * 0.01); // 微信支付手续费1%
						this.onPay(Math.round(res * 100));
					}
				});
			},
			round(num) {
				return Math.round(num * 100) / 100;
			},
			toPosition() {
				uni.navigateTo({
					url: "/pages-project/position/position?id=" + this.data._id + "&userId=" + this.data.user_id[0]._id
				});
			},
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
							if (store.hasLogin) {
								this.shareProject();
							} else {
								this.$refs.popup.show({
									type: "text",
									title: "提示",
									text: "请登录后再继续吧！",
									success: () => {
										this.$refs.popup.hide();
										uni.navigateTo({
											url: "/" + pagesJson.uniIdRouter.loginPage
										});
									}
								});
							}
						} else if (index == 1) {
							this.$refs.tooltip.show();
						} else if (index == 2) {
							this.$refs.popup.hide();
							uni.navigateTo({
								url: "/pages-project/project-create/project-create?id=" + this.data._id
							});
						} else if (index == 3) {
							this.deleteProject();
						}
					}
				});
			},
			deleteProject() {
				this.$refs.popup.show({
					type: "text",
					title: "提示",
					text: "确定要删除本项目吗？",
					success: () => {
						this.$refs.toast.show({
							type: "loading",
							text: "正在删除",
							duration: "none"
						});

						db.collection("db-projects").doc(this.projectId).remove().then(res => {
							this.$refs.toast.show({
								type: "success",
								text: "删除成功",
								duration: "2000"
							});

							setTimeout(() => {
								let pages = getCurrentPages();
								let prevPage = pages[pages.length - 2];

								prevPage.$vm.getProjects();

								uni.navigateBack();
							}, 1000)
						});
					}
				});
			},
			async openFile() {
				const urls = await getTempFileURL([this.data.file.path]);
				this.fileStatus = "正在下载";
				uni.downloadFile({
					url: urls[0],
					success: res => {
						// console.log(res);
						this.fileStatus = "正在打开";
						let filePath = res.tempFilePath;
						uni.openDocument({
							filePath: filePath,
							showMenu: true,
							success: res => {
								setTimeout(() => {
									this.fileStatus = "查看文件";
								}, 2000);
							}
						});
					}
				});
			},

			async getInvestors() {
				let tempInvestors = db.collection("db-project-investment").where(`project_id == "${this.projectId}"`)
					.orderBy("date desc").limit(5).getTemp();
				let tempUsers = db.collection("uni-id-users").field("_id, avatar_file, nickname").getTemp();

				let res = await db.collection(tempInvestors, tempUsers).field("user_id").distinct().get();
				let resData = res.result.data.reverse();
				console.log("investors", resData);

				this.avatars = resData.map(item => {
					return item.user_id[0].avatar_file.url;
				});

				let count = await db.collection("db-project-investment").where(`project_id == "${this.projectId}"`)
					.field("user_id").distinct().count();
				this.investorCount = count.result.total;
			},

			getPositions() {
				db.collection("db-positions").where(`project_id == "${this.projectId}"`).field("_id, title").get().then(res => {
					console.log("positions", res.result.data);
					this.positions = res.result.data;
				});
			},

			async getData() {
				let tempProject = db.collection("db-projects").where(`_id == "${this.projectId}"`).getTemp();
				let tempUser = db.collection("uni-id-users").field("_id, avatar_file, nickname").getTemp();

				let res = await db.collection(tempProject, tempUser).get();

				// console.log(res);

				let resData = res.result.data[0];
				const {
					nHtml
				} = await replaceImgSrc(resData.content, "getTempFileURL");
				resData.content = nHtml;
				console.log("data", resData);

				this.data = resData;

				this.getPositions();
				this.getInvestors();
				this.updateViewCount();

				this.isLoading = false;
			}
		},
		onShareAppMessage() {
			return {
				title: this.data.title,
				path: "/pages-project/project-detail/project-detail?id=" + this.projectId
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

		.info {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-top: 30rpx;

			.user {
				display: flex;
				align-items: center;

				.username {
					font-size: 28rpx;
					color: #666;
					margin-left: 15rpx;
				}
			}

			.tag {
				font-size: 24rpx;
				color: #666;
				width: fit-content;
				padding: 10rpx 20rpx;
				background: #eee;
				border-radius: 15rpx;
			}
		}

		.parse {
			color: #333;
			margin-top: 40rpx;
		}
	}

	.file-card {
		width: 100%;
		height: 100rpx;
		border-radius: 20rpx;
		margin-top: 25rpx;
		display: flex;
		align-items: center;
		overflow: hidden;
		background: #eee;

		.left {
			flex: 0 0 100rpx;
			height: 100%;
			background: #666;
			color: #fff;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 24rpx;
			font-weight: bold;
		}

		.right {
			flex: 1;
			height: 100%;
			padding: 15rpx 20rpx;
			display: flex;
			flex-direction: column;
			justify-content: space-around;

			.name {
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 1;
				-webkit-box-orient: vertical;
				font-size: 26rpx;
				color: #333;
			}

			.size {
				font-size: 24rpx;
				color: #666;
			}
		}

		.text {
			color: #666;
			font-size: 26rpx;
			margin-right: 30rpx;
		}
	}

	.footer {
		margin-top: 30rpx;

		.text {
			text-align: center;
			color: #999;
			font-size: 24rpx;
		}
	}

	.next-page {
		width: 100vw;
		background: #fff;
		box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
		border-radius: 25rpx 25rpx 0 0;
		position: fixed;
		bottom: 0;
		left: 0;

		.inner {
			padding: 35rpx 25rpx 0;
			display: flex;
			justify-content: space-between;
			align-items: center;

			.investors {
				display: flex;
				align-items: center;

				.text {
					font-size: 26rpx;
					margin-right: 15rpx;
					color: #666;
				}
			}

			.button {
				padding: 15rpx 30rpx;
				background: #333;
				border-radius: 15rpx;
				color: #fff;
				font-size: 28rpx;
			}
		}
	}

	.recruit-banner {
		padding: 10rpx;
		background: #eee;
		color: #333;
		display: flex;
		justify-content: center;
		line-height: 2;
		border-radius: 15rpx;
		font-size: 26rpx;
		margin-top: 40rpx;

		.iconfont {
			margin-left: 15rpx;
			font-size: 28rpx;
		}
	}
</style>