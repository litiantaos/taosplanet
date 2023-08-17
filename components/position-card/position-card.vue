<template>
	<view class="card" :style="{background: isShare ? '#f5f5f5' : '#fff' }" @click="toPositionDetail">
		<view class="top">
			<view class="title">{{data.title}}</view>
			<!-- <view class="salary">{{data.salary_min}}K-{{data.salary_max}}K·{{data.salary_num}}薪</view> -->
		</view>
		<view class="bottom">
			<view class="tag">{{data.education_name}}</view>
			<view class="tag">{{data.experience_name}}</view>
			<view class="tag">{{data.salary_min}}K-{{data.salary_max}}K·{{data.salary_num}}薪</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "position-card",
		props: {
			data: {
				type: Object,
				default: {}
			},
			isShare: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {

			};
		},
		methods: {
			toPositionDetail() {
				uni.navigateTo({
					url: "/pages-project/position/position-detail/position-detail?id=" + this.data._id
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