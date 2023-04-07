<template>
	<nav-bar></nav-bar>
	<safe-area></safe-area>

	<view class="container">
		<input-pro :inputIn="inputIn" @input="onInput"></input-pro>
		<view class="button" @click="submit">完成</view>
	</view>

	<toast ref="toast"></toast>
</template>

<script>
	import {
		store,
		mutations
	} from "@/uni_modules/uni-id-pages/common/store.js";

	const db = uniCloud.database();

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
			async submit() {
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

<style lang="scss" scoped>
	.container {
		margin: 25rpx;

		.button {
			height: 100rpx;
			background: #333;
			border-radius: 20rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			color: #fff;
			font-size: 28rpx;
			margin: 80rpx 0;
			transition: opacity .2s;

			&:active {
				opacity: 0.8;
			}
		}
	}
</style>