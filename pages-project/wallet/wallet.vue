<template>
	<view class="container">
		<view class="card">
			<view class="unit">¥</view>
			<view class="amount">{{amount}}</view>
		</view>

		<view class="title">资金明细</view>
		<view class="item">
			<view class="left">
				<view class="name">TAOVIA</view>
				<view class="text">ProJeCT</view>
			</view>
			<view class="right">¥1.5</view>
		</view>
	</view>
</template>

<script>
	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

	const db = uniCloud.database();

	export default {
		data() {
			return {
				amount: 0
			};
		},
		onLoad() {
			this.getAmount();
		},
		methods: {
			async getAmount() {
				let res = await db.collection("db-projects").where(`user_id == "${store.userInfo._id}"`)
					.field("total_investment").get();
				let resData = res.result.data;
				console.log(resData);

				let total = 0;

				resData.forEach(item => {
					total += item.total_investment;
				});

				this.amount = total;
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

	.card {
		height: 400rpx;
		background: #65B787;
		border-radius: 20rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #fff;

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

	.title {
		font-size: 36rpx;
		font-weight: bold;
		margin-top: 50rpx;
	}

	.item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 28rpx;
		padding: 25rpx;
		background: #eee;
		border-radius: 20rpx;
		margin-top: 25rpx;

		.left {
			// font-size: 28rpx;

			.name {
				font-weight: bold;
			}

			.text {
				color: #999;
			}
		}

		.right {
			font-size: 32rpx;
			font-weight: bold;
		}
	}
</style>