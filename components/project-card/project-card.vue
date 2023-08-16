<template>
	<view>
		<view class="card" :style="{background: isShare ? '#f5f5f5' : '#fff' }" @click="toProjectDetail">
			<view class="header">
				<view class="title line-clamp">{{data.title}}</view>
				<view v-if="showUser" class="user">
					<cloud-file :src="data.user_id[0]" width="40rpx" height="40rpx" borderRadius="50%"></cloud-file>
					<view class="username">{{data.user_id[0].nickname}}</view>
				</view>
				<view class="intro line-clamp">{{data.excerpt}}</view>
			</view>
			<view class="body">
				<view v-if="!isShare && avatars.length > 0" class="investors">
					<avatar-group :avatars="avatars" radius="50rpx"></avatar-group>
					<view class="text">{{investorCount}}人已支持</view>
				</view>
			</view>
			<view v-if="positionsStr" :class="isShare ? 'footer-share' : 'footer'">
				<view class="title">招募</view>
				<view class="text line-clamp">{{positionsStr}}</view>
			</view>
		</view>
	</view>
</template>

<script>
	const db = uniCloud.database();

	export default {
		name: "project-card",
		props: {
			data: {
				type: Object,
				default: {}
			},
			showUser: {
				type: Boolean,
				default: true
			},
			isShare: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				avatars: [],
				investorCount: 0,
				positionsStr: ""
			};
		},
		mounted() {
			this.getPositions();
			this.getInvestors();
		},
		watch: {
			data(newVal) {
				// console.log("newVal", newVal);
				if (newVal._id) {
					this.getPositions();
				}
			}
		},
		methods: {
			async getInvestors() {
				let tempInvestors = db.collection("db-project-investment").where(`project_id == "${this.data._id}"`)
					.orderBy("date desc").limit(5).getTemp();
				let tempUsers = db.collection("uni-id-users").field("_id, avatar_file, nickname").getTemp();

				let res = await db.collection(tempInvestors, tempUsers).field("user_id").distinct().get();
				let resData = res.result.data.reverse();
				// console.log("investors", resData);

				this.avatars = resData.map(item => {
					return item.user_id[0].avatar_file.url;
				});

				let count = await db.collection("db-project-investment").where(`project_id == "${this.data._id}"`)
					.field("user_id").distinct().count();
				this.investorCount = count.result.total;
			},
			async getPositions() {
				let res = await db.collection("db-positions").where(`project_id == "${this.data._id}"`)
					.field("_id, title").get();

				let resData = res.result.data;
				// console.log("getPositions", resData);

				if (resData.length != 0) {
					let str = resData.map(item => item.title).join("、");
					this.positionsStr = str;
					// console.log("str", str);
				}
			},
			toProjectDetail() {
				uni.navigateTo({
					url: "/pages-project/project-detail/project-detail?id=" + this.data._id
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.card {
		padding: 25rpx;
		margin-bottom: 25rpx;
		border-radius: 20rpx;

		.title {
			font-weight: bold;
			-webkit-line-clamp: 1;
		}

		.user {
			display: flex;
			align-items: center;
			margin-top: 20rpx;

			.username {
				font-size: 28rpx;
				color: #666;
				margin-left: 15rpx;
			}
		}

		.intro {
			font-size: 28rpx;
			line-height: 42rpx;
			-webkit-line-clamp: 2;
			margin-top: 20rpx;
		}

		.investors {
			display: flex;
			align-items: center;
			margin-top: 20rpx;

			.text {
				font-size: 28rpx;
				margin-left: 15rpx;
				color: #666;
			}
		}

		.footer {
			background: #f5f5f5;
			border-radius: 15rpx;
			padding: 20rpx;
			font-size: 28rpx;
			margin-top: 20rpx;
			display: flex;
			align-items: center;
			color: #333;

			.title {
				font-weight: bold;
				margin-right: 10rpx;
			}

			.text {
				flex: 1;
				-webkit-line-clamp: 1;
			}
		}

		.footer-share {
			margin-top: 20rpx;
			border-top: 1rpx solid #e5e5e5;
			font-size: 28rpx;
			display: flex;
			align-items: center;
			color: #333;
			padding-top: 20rpx;

			.title {
				font-weight: bold;
				margin-right: 10rpx;
			}

			.text {
				flex: 1;
				-webkit-line-clamp: 1;
			}
		}
	}

	.line-clamp {
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-box-orient: vertical;
	}
</style>