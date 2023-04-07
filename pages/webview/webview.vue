<template>
	<view>
		<web-view :src="url"></web-view>
	</view>

	<toast ref="toast"></toast>
</template>

<script>
	export default {
		data() {
			return {
				url: null
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
				this.url = e.url;
			}

			if (e.title) {
				uni.setNavigationBarTitle({
					title
				});
			}
		}
	}
</script>

<style lang="scss">

</style>