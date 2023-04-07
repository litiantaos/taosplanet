<template>
	<view class="load-more">
		<view v-if="status == 'loading'">加载中...</view>
		<view v-else-if="status == 'noMore'">没有更多了哦~</view>
		<view v-else>上拉加载更多</view>
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
	}
</style>