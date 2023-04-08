<template>
	<view class="nav-bar" :style="{background, opacity}">
		<safe-area type="top"></safe-area>
		<view class="nav-bar_content" :style="{justifyContent, opacity: innerOpacity}">
			<i v-if="showBackBtn" class="iconfont icon-arrow-left" :style="{color: backBtnColor}" @click="toBack"></i>
			<view v-if="showTitle" class="title">{{title}}</view>
			<slot></slot>
		</view>
	</view>
</template>

<script>
	export default {
		name: "nav-bar",
		props: {
			background: {
				type: String,
				default: "#f5f5f5"
			},
			opacity: {
				type: Number,
				default: 1
			},
			justifyContent: {
				type: String,
				default: "flex-start"
			},
			showBackBtn: {
				type: Boolean,
				default: true
			},
			backBtnColor: {
				type: String,
				default: "#000"
			},
			innerOpacity: {
				type: Number,
				default: 1
			},
			showTitle: {
				type: Boolean,
				default: false
			},
			title: {
				type: String,
				default: ""
			},
		},
		data() {
			return {};
		},
		methods: {
			toBack() {
				uni.navigateBack();
			}
		}
	}
</script>

<style lang="scss" scoped>
	.nav-bar {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 999;
		width: 100%;
		transition: background .3s, opacity .3s;

		&_content {
			display: flex;
			align-items: center;
			height: 44px;
			padding: 6px 25rpx;
			transition: opacity .3s;

			.iconfont {
				font-size: $uni-img-size-sm;
			}

			.title {
				font-size: 28rpx;
			}
		}
	}
</style>