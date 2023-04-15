<template>
	<view class="comment-bar" :style="{transform: (isFocus ? `translateY(${-keyboardHeight}px)` : `translateY(0)`)}"
		:class="{'active': isFocus}">
		<view v-if="tempImagePaths.length" class="images-wrap">
			<scroll-view-pro :list="tempImagePaths" v-slot="{item, index}">
				<view class="image-wrap">
					<image class="image" :src="item" mode="aspectFill" @click="previewImage(index)"></image>
					<view class="iconfont icon-close-circle-fill delete-btn" @click="removeImage(index)"></view>
				</view>
			</scroll-view-pro>
		</view>
		<view class="input-wrap">
			<input class="input" type="text" :placeholder="placeholder" :value="inputValue" :focus="isAutoFocus"
				:adjust-position="false" confirm-type="send" @input="onInput" @confirm="publish" @focus="onFocus"
				@blur="onBlur" />
			<view class="iconfont icon-gallery" @click="chooseImage"></view>
		</view>
	</view>
</template>

<script>
	import {
		uploadFile,
		checkContent,
		checkMedia
	} from "@/common/cloud.js";

	const db = uniCloud.database();
	const utils = uniCloud.importObject("utils", {
		customUI: true
	});

	export default {
		name: "comment-bar",
		props: {
			data: {
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
			},
			postData: {
				type: Object,
				default: {}
			}
		},
		data() {
			return {
				inputValue: "",
				isFocus: false,
				keyboardHeight: 0,
				tempImagePaths: []
			};
		},
		methods: {
			async publish() {
				if (!this.inputValue) {
					this.$emit("toast", {
						type: "info",
						text: "说点什么吧",
						duration: "2000"
					});
					return;
				}

				let data = {
					comment_content: this.inputValue,
					...this.data
				}

				if (this.data.comment_type == 1) {
					data.comment_type = 1;
					data.reply_user_id = this.data.reply_user_id;
					data.reply_comment_id = this.data.reply_comment_id;
				}

				if (this.tempImagePaths.length) {
					let fileIds = await uploadFile({
						tempPaths: this.tempImagePaths,
						path: "comments/images/"
					});

					data.comment_images = fileIds;
				}

				// 文本安全检测
				await checkContent(data.comment_content).then(res => {
					console.log(res);
					if (res == 1) {
						data.sec_check = 1;
					}
				});

				if (data.comment_images?.length) {
					// 图片安全检测
					data.comment_images.map(async item => {
						await checkMedia(item).then(res => {
							console.log(res);
							if (res == 1) {
								data.sec_check = 1;
								return;
							}
						});
					});
				}

				db.collection("db-posts-comments").add(data).then(res => {
					// console.log(res);

					utils.calc("db-posts", "comment_count", this.data.post_id, 1);

					if (data.sec_check && data.sec_check == 1) {
						this.$emit("toast", {
							type: "error",
							text: "内容违规，待人工审核",
							duration: "2000"
						});
					} else {
						if (this.data.comment_type == 0) {
							uniCloud.callFunction({
								name: "push",
								data: {
									user_id: this.postData.user_id,
									payload: {
										type: "comment",
										content: "评论了你的动态",
										excerpt: data.comment_content.substr(0, 15),
										post_id: this.postData.post_id,
										user_id: this.postData.user_id,
										from_user_id: this.postData.from_user_id,
										from_user_name: this.postData.from_user_name,
										from_user_avatar: this.postData.from_user_avatar,
										date: Date.now()
									}
								}
							});
						} else if (this.data.comment_type == 1) {
							uniCloud.callFunction({
								name: "push",
								data: {
									user_id: data.reply_user_id,
									payload: {
										type: "reply",
										content: "回复了你的评论",
										excerpt: data.comment_content.substr(0, 15),
										post_id: this.postData.post_id,
										user_id: data.reply_user_id,
										from_user_id: this.postData.from_user_id,
										from_user_name: this.postData.from_user_name,
										from_user_avatar: this.postData.from_user_avatar,
										date: Date.now()
									}
								}
							});
						}

						this.$emit("toast", {
							type: "success",
							text: "发布成功",
							duration: "2000"
						});
					}

					this.$emit("afterSend", {
						placeholder: "说点什么吧~",
						comment_type: 0
					});

					this.inputValue = "";
					this.tempImagePaths = [];
				});
			},

			// 选择图片
			chooseImage() {
				uni.chooseMedia({
					mediaType: ["image"],
					count: 2,
					success: res => {
						// console.log(res);

						let tempFilePaths = res.tempFiles.map(item => {
							return item.tempFilePath
						});

						let arr = [...this.tempImagePaths, ...tempFilePaths];
						arr = arr.slice(0, 2);
						this.tempImagePaths = arr;
					}
				});
			},
			removeImage(index) {
				this.tempImagePaths.splice(index, 1);
			},
			previewImage(index) {
				uni.previewImage({
					current: index,
					urls: this.tempImagePaths
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

		.images-wrap {
			margin-bottom: 25rpx;

			.image-wrap {
				position: relative;
			}

			.image {
				width: 150rpx;
				height: 150rpx;
				background: #eee;
				border: 1px solid #eee;
				border-radius: 15rpx;
				box-sizing: border-box;
				vertical-align: bottom;
			}

			.delete-btn {
				position: absolute;
				top: 10rpx;
				right: 10rpx;
				font-size: 36rpx;
				color: #fff;
				opacity: 0.6;
			}
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