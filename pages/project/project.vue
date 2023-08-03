<template>
	<view>
		<float-search iconName="add"></float-search>

		<view class="main">
			<view class="" v-for="(item, index) in projects" :key="index">
				<project-card :data="item"></project-card>
			</view>
		</view>

		<safe-area type="tabBar"></safe-area>
	</view>

	<tab-bar :index="1"></tab-bar>
</template>

<script>
	export default {
		data() {
			return {
				projects: [1, 2, 3, 4]
			};
		},
		onPageScroll(e) {
			uni.$emit("onPageScroll", e.scrollTop);
		}
	}
</script>

<style lang="scss" scoped>
	.main {
		margin-top: 120rpx;
	}
</style>