<template>
	<view class="container">
		<nav-bar background="rgba(0,0,0,0)" backBtnColor="#fff"></nav-bar>
		<safe-area type="top"></safe-area>
		<video class="video" :src="src" autoplay enable-play-gesture></video>
	</view>

	<toast ref="toast"></toast>
</template>

<script>
	export default {
		data() {
			return {
				src: ""
			};
		},
		onLoad(e) {
			if (!e.url) {
				this.$refs.toast.show({
					type: "error",
					text: "参数错误",
					duration: "2000"
				});
				setTimeout(() => {
					uni.navigateBack();
				}, 500);
			} else {
				this.src = e.url;
			}
		}
	}
</script>

<style>
	page {
		background: #000;
	}
</style>

<style lang="scss" scoped>
	.container {
		width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		// padding-bottom: env(safe-area-inset-bottom);

		.video {
			width: 100%;
			height: 100%;
		}
	}
</style>