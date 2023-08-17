<template>
	<view>
		<view v-if="hasLogin && userInfo._id == this.userId" class="init-wrap"
			:style="{height: positions.length ? '200rpx' : '100vh'}">
			<view v-if="!positions.length" class="text">你可以发布多个招募职位</view>
			<view class="btn" @click="toCreate">发布职位</view>
		</view>

		<view class="container">
			<view v-for="(item, index) in positions" :key="index">
				<position-card :data="item"></position-card>
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

	.container {
		padding: 25rpx;
	}
</style>