<template>
	<view>
		<view v-if="hasLogin && userInfo._id == this.userId" class="init-wrap"
			:style="{height: positions.length ? '200rpx' : '100vh'}">
			<view v-if="!positions.length" class="text">你可以发布多个招募职位</view>
			<view class="btn" @click="toCreate">发布职位</view>
		</view>

		<view v-for="(item, index) in positions" :key="index">
			<view class="card" @click="toPositionDetail(item)">
				<view class="top">
					<view class="title">{{item.title}}</view>
					<!-- <view class="salary">{{item.salary_min}}K-{{item.salary_max}}K·{{item.salary_num}}薪</view> -->
				</view>
				<view class="bottom">
					<view class="tag">{{item.education_name}}</view>
					<view class="tag">{{item.experience_name}}</view>
					<view class="tag">{{item.salary_min}}K-{{item.salary_max}}K·{{item.salary_num}}薪</view>
				</view>
			</view>
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
				positions: [],
				projectId: "",
				userId: ""
			};
		},
		onLoad(e) {
			this.projectId = e.id;
			this.userId = e.userId;
			console.log(e);
			this.getPositions();
		},
		computed: {
			userInfo() {
				return store.userInfo;
			},
			hasLogin() {
				return store.hasLogin;
			}
		},
		methods: {
			toPositionDetail({
				_id
			}) {
				uni.navigateTo({
					url: "/pages-project/position-detail/position-detail?id=" + _id
				});
			},
			getPositions() {
				db.collection("db-positions").where(`project_id == "${this.projectId}"`)
					.field("_id, title, education_name, experience_name, salary_min, salary_max, salary_num").get().then(res => {
						this.positions = res.result.data;
						// console.log("positions", this.positions);

						setTimeout(() => {
							uni.stopPullDownRefresh();
						}, 500);
					});
			},
			toCreate() {
				uni.navigateTo({
					url: "/pages-project/position/position-create/position-create?projectId=" + this.projectId
				})
			}
		},
		onPullDownRefresh() {
			this.getPositions();
		}
	}
</script>

<style lang="scss" scoped>
	.init-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;

		.text {
			font-size: 28rpx;
			color: #666;
			margin-bottom: 60rpx;
		}

		.btn {
			padding: 20rpx 40rpx;
			background: #333;
			border-radius: 20rpx;
			font-size: 26rpx;
			color: #fff;
		}
	}

	.card {
		padding: 25rpx;
		margin: 25rpx;
		background: #fff;
		border-radius: 20rpx;

		.top {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 25rpx;

			.title {
				font-weight: bold;
				color: #333;
			}

			.salary {
				font-weight: bold;
				color: #666;
			}
		}

		.bottom {
			display: flex;
			align-items: center;

			.tag {
				width: fit-content;
				padding: 10rpx 15rpx;
				font-size: 24rpx;
				background: #eee;
				border-radius: 10rpx;
				margin-right: 15rpx;
			}
		}
	}
</style>