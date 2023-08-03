<template>
	<view class="header" :style="{top: `${height}px`, transform: (offsetY ? 'translateY(-100%)' : 'translateY(0)')}">
		<view class="search-box" @click="onSearch">{{searchText}}</view>
		<view class="search-btn" @click="onButton">
			<view v-if="iconName" :class="`iconfont icon-${iconName}`"></view>
			<view v-else class="">{{btnText}}</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "float-search",
		props: {
			searchText: {
				type: String,
				default: "搜索"
			},
			btnText: {
				type: String,
				default: ""
			},
			iconName: {
				type: String,
				default: ""
			},
			custom: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				height: 0,
				offsetY: false,
				startScrollTop: 0,
				endScrollTop: 0
			};
		},
		mounted() {
			let {
				safeAreaInsets
			} = getApp().globalData.systemInfo;

			if (this.custom) {
				this.height = safeAreaInsets.top + 44;
			} else {
				this.height = 0;
			}

			uni.$on("onPageScroll", e => {
				this.setOffset(e);
			});
		},
		methods: {
			onSearch() {
				this.$emit("onSearch");
			},
			onButton() {
				this.$emit("onButton");
			},
			setOffset(e) {
				setTimeout(() => {
					this.startScrollTop = e;
					setTimeout(() => {
						this.endScrollTop = e;
					}, 1000);
				}, 10);

				if (this.startScrollTop > this.endScrollTop) {
					this.offsetY = true;
				} else if (this.startScrollTop < this.endScrollTop) {
					this.offsetY = false;
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.header {
		padding: 25rpx;
		display: flex;
		position: fixed;
		left: 0;
		width: 100%;
		background: #f5f5f5;
		z-index: 99;
		transition: transform .5s;

		.search-box {
			flex: 1;
			height: 70rpx;
			background: #e5e5e5;
			border-radius: 20rpx;
			display: flex;
			align-items: center;
			padding: 0 30rpx;
			font-size: 28rpx;
			color: #666;
			transition: background .2s;

			&:active {
				background: #ccc;
			}
		}

		.search-btn {
			width: 120rpx;
			height: 70rpx;
			padding: 0 20rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			background: #e5e5e5;
			border-radius: 20rpx;
			margin-left: 20rpx;
			font-size: 28rpx;
			font-family: "Asap", sans-serif;
			color: #333;
			transition: background .2s;

			&:active {
				background: #ccc;
			}
		}
	}
</style>