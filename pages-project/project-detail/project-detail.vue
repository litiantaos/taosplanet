<template>
	<view>
		<view class="container">
			<view class="title-wrap">
				<view class="title">{{data.title}}</view>
				<view class="iconfont icon-more-circle" @click="clickMore"></view>
			</view>
			<view class="info">
				<view v-if="data.user_id" class="user">
					<cloud-file :src="data.user_id[0]" width="50rpx" height="50rpx" borderRadius="50%"></cloud-file>
					<view class="username">{{data.user_id[0].nickname}}</view>
				</view>
				<view class="tag">{{data.industry_name}}</view>
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

		<view class="anchor">
			<view style="height: 175rpx;"></view>
			<safe-area type="bottom"></safe-area>
		</view>

		<view class="next-page">
			<view class="inner">
				<view class="group">
					<view class="button" @click="onSupport">支持一下</view>
					<view class="investors">
						<view class="text">5人已支持</view>
						<avatar-group :avatars="avatars" radius="50rpx"></avatar-group>
					</view>
				</view>
				<view v-if="positions.length > 0" class="recruit" @click="toPosition">
					<view class="">正在招募伙伴</view>
					<view class="iconfont icon-arrow-circle-right"></view>
				</view>
			</view>
			<safe-area type="bottom"></safe-area>
		</view>
	</view>

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

	const db = uniCloud.database();

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
				avatars: [1, 2, 3, 4],
				positions: [],
				amount: 0
			};
		},
		onLoad(e) {
			this.projectId = e.id;

			this.getData();
		},
		methods: {
			onPaySuccess(e) {
				console.log(e);
				this.$refs.popup.show({
					type: "text",
					title: "支付成功！",
					text: "感谢你的投资，投资款将全额（扣除微信支付手续费2%）进入项目发起人的账户，你可以在项目详情中看到项目的全部受资情况。",
					success: () => {
						this.$refs.popup.hide();
					}
				});

				db.collection("db-project-investment").add({
					project_id: this.projectId,
					amount: this.amount
				}).then(res => {
					console.log("payData");
				});
			},
			onPay(fee) {
				let order_no = `test` + Date.now(); // 模拟生成订单号
				let out_trade_no = `${order_no}-1`; // 模拟生成插件支付单号
				// 打开支付收银台
				this.$refs.pay.open({
					total_fee: fee,
					order_no: order_no,
					out_trade_no: out_trade_no,
					description: "description",
					type: "test",
					custom: "custom"
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
						console.log(res);
						this.amount = res * 100;
						this.onPay(this.amount);
					}
				});
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
							this.$refs.popup.hide();
							// uni.navigateTo({
							// 	url: "/pages-fun/event/event-share/event-share"
							// });
						} else if (index == 1) {
							this.$refs.tooltip.show();
						} else if (index == 2) {
							uni.navigateTo({
								url: "/pages-project/project-create/project-create?id=" + this.data._id
							});
						} else if (index == 3) {
							this.deleteProject();
						}
					}
				})
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

			getPositions() {
				db.collection("db-positions").where(`project_id == "${this.projectId}"`).field("_id, title").get().then(res => {
					console.log(res.result.data);
					this.positions = res.result.data;
				})
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
				console.log(resData);

				this.data = resData;

				this.getPositions();
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
				font-size: 36rpx;
				color: #666;
			}
		}

		.info {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin: 30rpx 0 40rpx 0;

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

	.next-page {
		width: 100vw;
		background: #fff;
		box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
		border-radius: 25rpx 25rpx 0 0;
		position: fixed;
		bottom: 0;
		left: 0;

		.inner {
			padding: 35rpx 25rpx 0;

			.group {
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
					padding: 15rpx 25rpx;
					background: #333;
					border-radius: 15rpx;
					color: #fff;
					font-size: 26rpx;
				}
			}

			.recruit {
				display: flex;
				justify-content: flex-end;
				margin-top: 10rpx;
				font-size: 26rpx;
				color: #333;
				line-height: 2;

				.iconfont {
					margin-left: 15rpx;
					font-size: 28rpx;
				}
			}
		}
	}
</style>