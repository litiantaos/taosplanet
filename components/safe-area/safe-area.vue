<template>
	<view class="safe-area" :style="{height: `${height}px`}">
		<slot></slot>
	</view>
</template>

<script>
	export default {
		name: "safe-area",
		props: {
			type: {
				type: String,
				default: ""
			}
		},
		data() {
			return {
				height: 0
			};
		},
		mounted() {
			let {
				safeAreaInsets
			} = getApp().globalData.systemInfo;

			if (this.type == "top") {
				this.height = safeAreaInsets.top;
			} else if (this.type == "bottom") {
				this.height = safeAreaInsets.bottom;
			} else {
				this.height = safeAreaInsets.top + 44;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.safe-area {
		width: 100%;
	}
</style>