<template>
	<edit-view :inputIn="inputIn" @input="onInput" @confirm="onConfirm"></edit-view>
	<toast ref="toast"></toast>
</template>

<script>
	import {
		store,
		mutations
	} from "@/uni_modules/uni-id-pages/common/store.js";

	export default {
		data() {
			return {
				inputIn: {
					placeholder: "可以简要描述一下自己",
					value: "",
					textarea: true,
					maxlength: 150,
					autoHeight: true
				}
			};
		},
		onLoad() {
			this.inputIn.value = this.userInfo.intro ? this.userInfo.intro : "";
		},
		computed: {
			userInfo() {
				return store.userInfo
			}
		},
		methods: {
			onInput(e) {
				this.inputIn.value = e;
			},
			async onConfirm() {
				let intro = this.inputIn.value;

				if (!intro) return;

				this.$refs.toast.show({
					type: "loading",
					text: "正在更新",
					duration: "none"
				});

				try {
					mutations.updateUserInfo({
						intro
					});

					this.$refs.toast.show({
						type: "success",
						text: "更新成功",
						duration: "2000"
					});
				} catch (err) {
					console.log(err);
				}

				setTimeout(() => {
					uni.navigateBack();
				}, 1000);
			}
		}
	}
</script>

<style lang="scss">

</style>