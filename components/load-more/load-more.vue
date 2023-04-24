<template>
	<view class="load-more">
		<view v-if="status == 'loading'" class="loading">
			<i class="iconfont icon-ring"></i>
		</view>
		<view v-else-if="status == 'noMore'">没有更多了哦~</view>
		<view v-else>加载更多</view>
	</view>
</template>

<script>
	export default {
		name: "load-more",
		props: {
			status: {
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
	.load-more {
		display: flex;
		justify-content: center;
		padding: $uni-spacing-base;
		font-size: $uni-font-size-sm;
		color: $uni-text-color-grey-l;

		.loading {
			display: flex;
			justify-content: center;
			align-items: center;

			.iconfont {
				font-size: 34rpx;
				color: #999;
				animation: loading 1s linear infinite;

				@keyframes loading {
					0% {
						transform: rotate(0deg);
					}

					100% {
						transform: rotate(360deg);
					}
				}
			}
		}
	}
</style>