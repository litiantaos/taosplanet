<template>
	<view>
		<edit-view :inputIn="inputIn" confirmType="确定" @input="onInput" @confirm="onConfirm"></edit-view>
		<toast ref="toast"></toast>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				inputIn: {
					placeholder: "可以简要对活动内容进行说明",
					value: "",
					textarea: true,
					maxlength: 500,
					autoHeight: true
				}
			};
		},
		onLoad() {
			let data = uni.getStorageSync("event-intro");
			this.inputIn.value = data;
		},
		methods: {
			onInput(e) {
				this.inputIn.value = e;
			},
			async onConfirm() {
				let intro = this.inputIn.value;

				let pages = getCurrentPages();
				let prevPage = pages[pages.length - 2];

				prevPage.$vm.data.intro = intro;
				uni.navigateBack();
			}
		}
	}
</script>

<style lang="scss">

</style>