<template>
	<view class="comment-bar" :style="{transform: (isFocus ? `translateY(${-keyboardHeight}px)` : `translateY(0)`)}"
		:class="{'active': isFocus}">
		<view class="input-wrap">
			<input class="input" type="text" :placeholder="placeholder" :value="inputValue" :focus="isAutoFocus"
				:adjust-position="false" confirm-type="send" @input="onInput" @confirm="publish" @focus="onFocus"
				@blur="onBlur" />
			<i class="iconfont icon-gallery"></i>
		</view>
	</view>
</template>

<script>
	const db = uniCloud.database();
	const utils = uniCloud.importObject("utils", {
		customUI: true
	});

	export default {
		name: "comment-bar",
		props: {
			comment: {
				type: Object,
				default: {}
			},
			placeholder: {
				type: String,
				default: ""
			},
			isAutoFocus: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				inputValue: "",
				isFocus: false,
				keyboardHeight: 0
			};
		},
		methods: {
			publish() {
				if (!this.inputValue) {
					this.$emit("toast", {
						type: "info",
						text: "说点什么吧",
						duration: "2000"
					})
					return;
				}

				let data = {
					comment_content: this.inputValue,
					...this.comment
				}

				if (this.comment.comment_type == 1) {
					data.comment_type = 1;
					data.reply_user_id = this.comment.reply_user_id;
					data.reply_comment_id = this.comment.reply_comment_id;
				}

				db.collection("db-posts-comments").add(data).then(res => {
					console.log(res);
					this.$emit("toast", {
						type: "success",
						text: "发送成功",
						duration: "2000"
					});

					this.$emit("updated", {
						placeholder: "说点什么吧~",
						comment_type: 0
					});

					this.inputValue = "";

					utils.calc("db-posts", "comment_count", this.comment.post_id, 1);
				});
			},
			onInput(e) {
				// console.log(e);
				this.inputValue = e.target.value;
				this.$emit("input", this.inputValue);
			},
			onFocus(e) {
				// console.log(e.detail);
				this.isFocus = true;
				this.keyboardHeight = e.detail.height;
			},
			onBlur() {
				this.isFocus = false;
				this.$emit("blur");
			},
		}
	}
</script>

<style lang="scss" scoped>
	.comment-bar {
		width: 100%;
		background: #fff;
		position: fixed;
		bottom: 0;
		left: 0;
		padding: 25rpx 25rpx env(safe-area-inset-bottom) 25rpx;
		transition: transform .3s, padding .3s;

		&.active {
			padding: 25rpx;
		}

		.input-wrap {
			width: 100%;
			height: 80rpx;
			background: #eee;
			border-radius: 15rpx;
			padding: 0 25rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;

			.input {
				width: 100%;
				height: 100%;
				font-size: 28rpx;
				line-height: 80rpx;
			}

			.iconfont {
				font-size: 40rpx;
				margin-left: 20rpx;
			}
		}
	}
</style>