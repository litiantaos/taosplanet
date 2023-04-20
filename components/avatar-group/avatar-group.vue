<template>
	<view>
		<view class="avatar-group">
			<view class="avatar-item" :style="{width: radius, height: radius, borderColor}" v-for="(item, index) in avatars"
				:key="index">
				<cloud-file :src="item" width="100%" height="100%"></cloud-file>
			</view>
			<view class="avatar-item more" :style="{width: radius, height: radius, borderColor}">
				<view v-if="moreText" class="text">{{moreText}}</view>
				<view v-else class="text">···</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "avatar-group",
		props: {
			avatars: {
				type: Array,
				default: []
			},
			radius: {
				type: String,
				default: "60rpx"
			},
			borderColor: {
				type: String,
				default: "#fff"
			},
			moreText: {
				type: String,
				default: ""
			}
		},
		data() {
			return {

			};
		}
	}
</script>

<style lang="scss" scoped>
	.avatar-group {
		display: flex;
		align-items: center;

		.avatar-item {
			border-radius: 50%;
			border: 2px solid;
			background: #eee;
			overflow: hidden;

			&:not(:first-child) {
				margin-left: -20rpx;
			}

			&.more {
				display: flex;
				justify-content: center;
				align-items: center;

				.text {
					font-size: 20rpx;
					font-weight: bold;
					color: #666;
				}
			}
		}
	}
</style>