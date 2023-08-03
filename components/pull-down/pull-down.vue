<template>
	<view class="pull-down" @touchstart="touchStart" @touchmove="touchMove" @touchend="touchEnd">
		<slot></slot>
	</view>

	<toast ref="toast"></toast>
</template>

<script>
	export default {
		name: "pull-down",
		props: {
			mode: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				startY: 0,
				offsetY: 0,
				threshold: 100,
				pageScrollTop: 0
			};
		},
		mounted() {
			uni.$on("onPageScroll", e => {
				// console.log(e);
				this.pageScrollTop = e;
			});
		},
		methods: {
			touchStart(e) {
				if (this.pageScrollTop > 0) return;
				this.startY = e.touches[0].clientY;
			},
			touchMove(e) {
				if (this.pageScrollTop > 0) return;

				let offsetY = e.touches[0].clientY - this.startY;

				this.offsetY = offsetY;

				if (offsetY > this.threshold) {
					this.show();
					this.$emit("show");
				}
			},
			touchEnd(e) {
				if (this.pageScrollTop > 0) return;

				if (this.offsetY > this.threshold) {
					this.$emit("start");
				} else {
					this.hide();
					this.$emit("hide");
				}

				this.offsetY = 0;
			},
			show() {
				this.$refs.toast.show({
					type: "loading",
					text: "加载中",
					duration: "none"
				});
			},
			hide() {
				this.$refs.toast.hide();
			},
			success() {
				this.$refs.toast.show({
					type: "success",
					text: "加载成功",
					duration: "1000"
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.pull-down {
		width: 100%;
	}
</style>