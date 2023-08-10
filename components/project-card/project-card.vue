<template>
	<view>
		<view class="card" @click="toProjectDetail">
			<view class="header">
				<view class="title line-clamp">{{data.title}}</view>
				<view class="user">
					<cloud-file class="avatar" :src="data.user_id[0]" width="40rpx" height="40rpx"
						borderRadius="50%"></cloud-file>
					<view class="username">{{data.user_id[0].nickname}}</view>
				</view>
				<view class="intro line-clamp">项目简介项目简介项目简介项目简介项目简介项目简介项目简介项目简介项目简介项目简介项目简介项目简介项目简介项目简介</view>
			</view>
			<view class="body">
				<view class="investors">
					<avatar-group :avatars="avatars" radius="50rpx"></avatar-group>
					<view class="text">5人已支持</view>
				</view>
			</view>
			<view class="footer">
				<view class="partner">
					<view class="title">招募</view>
					<view class="text line-clamp">合伙人、设计师合伙人、设计师合伙人、设计师合伙人、设计师合伙人、设计师合伙人、设计师合伙人、设计师</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "project-card",
		props: {
			data: {
				type: Object,
				default: {}
			},
		},
		data() {
			return {
				avatars: [1, 2, 3, 4]
			};
		},
		methods: {
			toProjectDetail() {
				uni.navigateTo({
					url: "/pages/project/project-detail/project-detail"
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
	.card {
		background: #fff;
		padding: 25rpx;
		margin: 25rpx;
		border-radius: 20rpx;

		.title {
			font-weight: bold;
			-webkit-line-clamp: 1;
		}

		.user {
			display: flex;
			align-items: center;
			margin: 20rpx 0;

			.avatar {
				width: 40rpx;
				height: 40rpx;
				border-radius: 50%;
				background: #eee;
				margin-right: 15rpx;
			}

			.username {
				font-size: 28rpx;
				color: #666;
			}
		}

		.intro {
			font-size: 28rpx;
			line-height: 42rpx;
			-webkit-line-clamp: 2;
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

		.partner {
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
	}

	.line-clamp {
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-box-orient: vertical;
	}
</style>