<template>
	<nav-bar></nav-bar>
	<safe-area></safe-area>

	<view class="container">
		<view class="title">
			<view>转发动态</view>
		</view>

		<view class="post">
			<post v-if="post.user_id" :data="post" :postId="post._id._value" :isSimple="true"></post>

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
				post: {},
				inputIn: {
					placeholder: "写下你的想法",
					value: "",
					textarea: true,
					maxlength: 300,
					showCount: true,
					style: "white"
				}
			};
		},
		onLoad() {
			this.post = uni.getStorageSync("post-share");
		},
		onUnload() {
			uni.removeStorageSync("post-share");
		},
		methods: {
			publish() {
				this.$refs.toast.show({
					type: "loading",
					text: "发布中",
					duration: "none"
				});

				db.collection("db-posts").add({
					shared_post_id: this.post._id,
					content: this.inputIn.value,
				}).then(res => {
					this.$refs.toast.show({
						type: "success",
						text: "发布成功",
						duration: "2000"
					});

					setTimeout(() => {
						uni.navigateBack();
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
	.container {
		.title {
			height: 80rpx;
			display: flex;
			align-items: center;
			font-size: 45rpx;
			font-weight: bold;
			margin: 25rpx;
		}

		.post {
			padding: 0 25rpx;
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