<template>
	<view class="container">
		<view class="card">
			<view class="unit">¥</view>
			<view class="amount">{{amount}}</view>
		</view>

		<view class="title-bar">资金明细</view>
		<view class="list">
			<view class="item" v-for="(item, index) in detailList" :key="index">
				<view class="top">
					<view class="name">{{item.user_id[0].nickname}}</view>
					<view class="num">¥{{item.amount}}</view>
				</view>
				<view class="bottom">
					<view class="text">{{item.project_id[0].title}}</view>
					<view class="date">
						<uni-dateformat :date="item.date" format="M/d h:mm" :threshold="[60000, 3600000*24*30]">
						</uni-dateformat>
					</view>
				</view>
			</view>
		</view>

		<load-more :status="loadMore"></load-more>
		<safe-area type="bottom"></safe-area>
	</view>
</template>

<script>
	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

	const db = uniCloud.database();
	const dbCmd = db.command;

	export default {
		data() {
			return {
				amount: 0,
				projects: [],
				detailList: [],
				loadMore: "",
				noMore: false
			};
		},
		onLoad() {
			this.getAmount();
		},
		methods: {
			async getAmountDetail() {
				let tempInvestment = await db.collection("db-project-investment").where({
					project_id: dbCmd.in(this.projectIds)
				}).orderBy("date desc").skip(this.detailList.length).limit(20).getTemp();

				let tempUser = await db.collection("uni-id-users").field("_id, avatar_file, nickname").getTemp();
				let tempProject = await db.collection("db-projects").field("_id, title").getTemp();

				let res = await db.collection(tempInvestment, tempUser, tempProject).get();

				let newData = res.result.data;

				if (newData.length == 0) {
					this.noMore = true;
					this.loadMore = "noMore";
					return;
				}

				let resData = [...this.detailList, ...newData];

				this.detailList = resData;
				// console.log(resData);
			},
			async getAmount() {
				let res = await db.collection("db-projects").where(`user_id == "${store.userInfo._id}"`)
					.field("total_investment").get();
				let resData = res.result.data;
				// console.log(resData);

				let total = 0;

				resData.forEach(item => {
					total += item.total_investment;
				});

				this.amount = total;

				this.projectIds = resData.map(item => {
					return item._id;
				});

				this.getAmountDetail();
			}
		},
		onReachBottom() {
			this.loadMore = "loading";
			if (this.noMore) {
				this.loadMore = "noMore";
				return;
			};
			this.getAmountDetail();
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
		// padding: 25rpx;
	}

	.card {
		height: 400rpx;
		background: #65B787;
		border-radius: 20rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #fff;
		margin: 25rpx;

		.amount {
			font-size: 70rpx;
			font-weight: bold;
		}

		.unit {
			font-size: 45rpx;
			font-weight: bold;
			margin-right: 25rpx;
			margin-top: 15rpx;
		}
	}

	.title-bar {
		font-size: 36rpx;
		font-weight: bold;
		padding: 30rpx 25rpx;
		position: sticky;
		top: 0;
		background: #fff;
	}

	.list {
		padding: 0 25rpx 25rpx 25rpx;
	}

	.item {
		font-size: 28rpx;
		padding: 25rpx;
		background: #f5f5f5;
		border-radius: 20rpx;
		margin-bottom: 20rpx;

		.top {
			display: flex;
			justify-content: space-between;
			align-items: center;

			.name {
				font-weight: bold;
			}

			.num {
				font-size: 32rpx;
				font-weight: bold;
			}
		}

		.bottom {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-top: 15rpx;

			.text {
				color: #666;
				font-size: 24rpx;
			}

			.date {
				color: #999;
				font-size: 24rpx;
			}
		}
	}
</style>