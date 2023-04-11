<template>
	<view>
		<popup ref="popup"></popup>
		<tooltip ref="tooltip"></tooltip>
	</view>
</template>

<script>
	export default {
		name: "share-handler",
		data() {
			return {

			};
		},
		methods: {
			handleShare() {
				let actions = [{
						text: "转发动态",
						icon: "icon-send-t",
					},
					{
						text: "分享到微信",
						icon: "icon-wechat",
						color: "#2aae67"
					}
				];

				this.$refs.popup.show({
					size: "small",
					type: "action",
					title: "分享",
					actions: actions,
					success: index => {
						if (index == 0) {
							this.$refs.popup.hide();
							uni.navigateTo({
								url: "/pages-post/post-share/post-share"
							});
						} else if (index == 1) {
							this.$refs.tooltip.show();
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss">

</style>