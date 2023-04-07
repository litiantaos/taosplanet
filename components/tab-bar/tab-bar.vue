<template>
	<view class="tab-bar">
		<view class="item" v-for="(item, index) in tabs" :key="index" @click="clickTab(item, index)">
			<image class="item-icon" :src="selectedIndex == index ? item.selectedIconPath : item.iconPath">
			</image>
			<view v-if="showText" class="item-text" :class="{'active': selectedIndex == index}">
				{{item.text}}
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "tab-bar",
		props: {
			index: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				selectedIndex: 0,
				showText: false,
				tabs: [{
						"text": "首页",
						"iconPath": "/static/icons/home.svg",
						"selectedIconPath": "/static/icons/home-fill.svg",
						"pagePath": "/pages/index/index"
					},
					{
						"text": "发现",
						"iconPath": "/static/icons/discover.svg",
						"selectedIconPath": "/static/icons/discover-fill.svg",
						"pagePath": "/pages/discover/discover"
					},
					{
						"text": "消息",
						"iconPath": "/static/icons/message.svg",
						"selectedIconPath": "/static/icons/message-fill.svg",
						"pagePath": "/pages/message/message"
					},
					{
						"text": "我的",
						"iconPath": "/static/icons/user.svg",
						"selectedIconPath": "/static/icons/user-fill.svg",
						"pagePath": "/pages/user/user"
					}
				]
			};
		},
		mounted() {
			uni.hideTabBar();
			this.selectedIndex = this.index;
		},
		methods: {
			clickTab(item, index) {
				this.$emit("change", index);

				uni.switchTab({
					url: item.pagePath
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.tab-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		z-index: 999;
		display: flex;
		width: 100%;
		height: 48px;
		padding-bottom: env(safe-area-inset-bottom);
		box-sizing: content-box;
		background: $uni-bg-color;

		.item {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			flex: 1;
			height: 100%;

			.item-icon {
				width: $uni-img-size-sm;
				height: $uni-img-size-sm;
			}

			.item-text {
				font-size: $uni-font-size-xs;
				color: $uni-text-color-grey-l;
				margin-top: $uni-spacing-sm;

				&.active {
					color: $uni-text-color;
				}
			}
		}
	}
</style>