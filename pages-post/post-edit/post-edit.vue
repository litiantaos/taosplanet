<template>
	<nav-bar></nav-bar>
	<safe-area></safe-area>

	<view>
		<view class="title">
			<view>编辑动态</view>
		</view>

		<view class="container">
			<view class="tip">暂时仅支持编辑文本</view>
			<input-pro :inputIn="inputIn" @input="onInput"></input-pro>
			<view class="button" @click="publish">发布</view>
		</view>
	</view>

	<toast ref="toast"></toast>
</template>

<script>
	const db = uniCloud.database();

	export default {
		data() {
			return {
				inputIn: {
					placeholder: "分享你的想法吧~",
					value: "",
					textarea: true,
					maxlength: -1,
					style: "white"
				},
				post: {}
			};
		},
		onLoad() {
			this.post = uni.getStorageSync("post-edit");
			this.inputIn.value = this.post.content;
		},
		methods: {
			publish() {
				this.$refs.toast.show({
					type: "loading",
					text: "发布中",
					duration: "none"
				});

				db.collection("db-posts").where(`_id == "${this.post._id}"`).update({
					content: this.inputIn.value,
					is_modified: true,
					last_modify_date: db.getCloudEnv("$cloudEnv_now"),
					last_modify_ip: db.getCloudEnv("$cloudEnv_clientIP")
				}).then(res => {
					this.$refs.toast.show({
						type: "success",
						text: "发布成功",
						duration: "2000"
					});

					setTimeout(() => {
						uni.reLaunch({
							url: "/pages/index/index"
						});
					}, 1000);
				});
			},
			onInput(e) {
				this.inputIn.value = e;
			},
		}
	}
</script>

<style lang="scss" scoped>
	.title {
		height: 80rpx;
		display: flex;
		align-items: center;
		font-size: 45rpx;
		font-weight: bold;
		margin: 25rpx;
	}

	.container {
		margin: 25rpx;

		.tip {
			font-size: 26rpx;
			color: #999;
			margin-bottom: 30rpx;
		}

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