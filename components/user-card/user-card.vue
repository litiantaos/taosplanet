<template>
	<view class="user-card" @click="toUserDetail(data._id)">
		<view class="user">
			<cloud-file :src="data" width="80rpx" height="80rpx" borderRadius="50%" border="1px solid #eee"></cloud-file>
			<view class="user-info">
				<view class="user-info-name">
					<name-init :data="data"></name-init>
				</view>
				<view class="user-info-desc">{{data.intro}}</view>
			</view>
		</view>
		<view v-if="btnText" class="user-btn" @click.stop="invite">{{btnText}}</view>
	</view>
</template>

<script>
	export default {
		name: "user-card",
		props: {
			data: {
				type: Object,
				default: {}
			},
			btnText: {
				type: String,
				default: ""
			}
		},
		data() {
			return {

			};
		},
		methods: {
			toUserDetail(e) {
				uni.navigateTo({
					url: "/pages-user/user-detail/user-detail?id=" + e
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
	.user-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 25rpx;
		background: #fff;
		border-radius: 20rpx;
		margin-bottom: 25rpx;

		.user {
			display: flex;
			justify-content: flex-start;
			align-items: center;

			.user-info {
				display: flex;
				flex-direction: column;
				justify-content: space-around;
				margin: 0 20rpx;
				width: 350rpx;

				.user-info-name {
					font-size: 28rpx;
					font-weight: bold;
				}

				.user-info-desc {
					font-size: 24rpx;
					color: #999;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}
		}

		.user-btn {
			font-size: 24rpx;
			background: #eee;
			border-radius: 10rpx;
			display: flex;
			justify-content: flex-end;
			align-items: center;
			padding: 10rpx 20rpx;
		}
	}
</style>