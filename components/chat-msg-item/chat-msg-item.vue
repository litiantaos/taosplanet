<template>
	<view class="msg-item" :class="{'reverse': isSelf}">
		<view class="msg-avatar"></view>
		<view class="wrap">
			<view class="username" :class="{'reverse': isSelf}">施工队小李</view>
			<view class="msg-content" :class="{'reverse': isSelf}">
				<text class="msg-content_text">这是一条消息</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "chat-msg-item",
		props: {
			isSelf: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {

			};
		}
	}
</script>

<style lang="scss" scoped>
	.msg-item {
		display: flex;

		&.reverse {
			flex-direction: row-reverse;
		}

		.msg-avatar {
			width: 70rpx;
			height: 70rpx;
			background: #ddd;
			border-radius: 50%;
		}

		.wrap {
			margin: 0 20rpx;

			.username {
				font-size: 22rpx;
				color: #999;
				height: 40rpx;

				&.reverse {
					text-align: end;
				}
			}

			.msg-content {
				display: flex;
				align-items: center;
				width: fit-content;
				max-width: 500rpx;
				padding: 15rpx 25rpx;
				background: #fff;
				color: #333;
				border-radius: 15rpx;

				&.reverse {
					background: #0396ff;
					color: #fff;
				}

				.msg-content_text {
					font-size: 28rpx;
					line-height: 40rpx;
					text-align: justify;
				}
			}
		}
	}
</style>