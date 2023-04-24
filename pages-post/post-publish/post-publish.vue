<template>
	<nav-bar></nav-bar>
	<safe-area></safe-area>

	<view class="container">
		<view class="title">
			<view>新的动态</view>
			<view v-if="data.content && data.topic_id" class="publish iconfont icon-arrow-right-t" @click="publish"></view>
		</view>

		<scroll-view class="topic-wrap" scroll-x :scroll-left="scrollLeft">
			<view class="topic-item" :class="{'selected': isSelected}" @click="showTopics">
				<view class="topic-item-text">{{isSelected ? topic : "试试添加话题吧..."}}</view>
				<i v-if="isSelected" class="iconfont icon-arrow-right"></i>
			</view>
			<view class="topic-item" :class="{'selected': isSelected}" v-for="(item, index) in recTopics" :key="index"
				@click="clickRecTopic({item, index})">
				<view class="topic-item-text">{{item.name}}</view>
			</view>
		</scroll-view>

		<view class="main">
			<view class="body">
				<textarea class="textarea" :style="`--textarea-height: ${textareaHeight};`" placeholder="分享你的想法吧~"
					maxlength="800" :show-confirm-bar="false" :adjust-position="false" @focus="onFocus" @blur="onBlur"
					@input="getInput"></textarea>

				<view class="wrap">
					<view v-if="data.location_name" class="location">
						<i class="iconfont icon-location-fill"></i>
						<view class="text">{{data.location_name}}</view>
						<i class="iconfont icon-close-circle-fill" @click="clearLocation"></i>
					</view>

					<view v-if="tempImagePaths.length || tempVideoPaths.length" class="media">
						<scroll-view-pro v-if="tempImagePaths.length" :list="tempImagePaths" v-slot="{item, index}">
							<view class="image-wrap">
								<image class="image" :src="item" mode="aspectFill" @click="previewImage(index)"></image>
								<view class="iconfont icon-close-circle-fill delete-btn" @click="removeImage(index)"></view>
							</view>
						</scroll-view-pro>

						<scroll-view-pro v-if="tempVideoPaths.length" :list="tempVideoPaths" v-slot="{item, index}">
							<view class="video-wrap">
								<video class="video" :src="item"></video>
								<view class="iconfont icon-close-circle-fill delete-btn" @click="removeVideo(index)"></view>
							</view>
						</scroll-view-pro>
					</view>

					<link-card v-if="data.link" :data="data.link" :showRemove="true" @handle="removeLink"></link-card>

					<view class="vote">
						<vote-editor v-if="showVote" :voteDate="voteDate" @input="getVoteValue"
							@chooseDate="chooseDate"></vote-editor>
					</view>
				</view>
			</view>

			<view class="footer">
				<i class="iconfont icon-gallery" @click="chooseImage"></i>
				<i class="iconfont icon-video" @click="chooseVideo"></i>
				<i class="iconfont icon-location" @click="chooseLocation"></i>
				<i class="iconfont icon-graph" @click="createVote"></i>
				<i class="iconfont icon-link" @click="editLink"></i>
			</view>
		</view>
	</view>

	<popup ref="popup"></popup>
	<toast ref="toast"></toast>
</template>

<script>
	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

	import {
		isValidUrl,
		throttle
	} from "@/common/utils.js";

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
		data() {
			return {
				screenHeight: 0,
				keyboardHeight: 0,
				data: {},
				topics: [],
				topic: "",
				recTopics: [],
				recTopicsNum: 5,
				isSelected: false,
				textareaHeight: "100%",
				tempImagePaths: [],
				tempVideoPaths: [],
				scrollLeft: 0,
				old: {
					scrollLeft: 0
				},
				showVote: false,
				voteDate: "",
				voteValue: []
			};
		},
		onLoad() {
			let {
				screenHeight
			} = getApp().globalData.systemInfo;

			this.screenHeight = screenHeight;

			this.getTopics();
		},
		computed: {
			userInfo() {
				return store.userInfo;
			}
		},
		methods: {
			// 发布内容入库
			async addData() {
				// 文本安全检测
				await checkContent(this.data.content).then(res => {
					console.log(res);
					if (res == 1) {
						this.data.sec_check = 1;
					}
				});

				if (this.data.images?.length) {
					// 图片安全检测
					this.data.images.map(async item => {
						await checkMedia(item).then(res => {
							console.log(res);
							if (res == 1) {
								this.data.sec_check = 1;
								return;
							}
						});
					});
				}

				if (this.data.videos?.length) {
					// 视频安全检测
					this.data.videos.map(async item => {
						await checkMedia(item).then(res => {
							console.log(res);
							if (res == 1) {
								this.data.sec_check = 1;
								return;
							}
						});
					});
				}

				if (this.showVote) {
					this.data.vote_end_date = this.voteDate;
				}

				console.log(this.data);

				db.collection("db-posts").add(this.data).then(async res => {
					console.log("addData", res);
					utils.calc("db-topics", "post_count", this.data.topic_id, 1);

					// VOTE
					if (this.showVote) {
						let arr = [];
						this.voteValue.forEach(item => {
							let obj = {};
							obj.option_content = item.value;
							obj.post_id = res.result.id;
							arr.push(obj);
						});

						await db.collection("db-votes-options").add(arr);
					}

					if (this.data.sec_check && this.data.sec_check == 1) {
						this.$refs.toast.show({
							type: "error",
							text: "内容违规，待人工审核",
							duration: "2000"
						});
					} else {
						this.$refs.toast.show({
							type: "success",
							text: "发布成功",
							duration: "2000"
						});
					}

					setTimeout(() => {
						uni.reLaunch({
							url: "/pages/index/index"
						});
					}, 1000);
				});
			},

			publish: throttle(async function() {
				this.$refs.toast.show({
					type: "loading",
					text: "发布中",
					duration: "none"
				});

				if (this.showVote) {
					if (this.voteValue.length) {
						if (!this.voteValue[0].value || !this.voteValue[1].value) {
							this.$refs.toast.show({
								type: "info",
								text: "投票至少两项",
								duration: "2000"
							});
							return;
						} else if (!this.voteDate) {
							this.$refs.toast.show({
								type: "info",
								text: "请选择投票时间",
								duration: "2000"
							});
							return;
						}
					} else {
						this.$refs.toast.show({
							type: "info",
							text: "投票至少两项",
							duration: "2000"
						});
						return;
					}
				}

				if (this.tempImagePaths.length) {
					let fileIds = await uploadFile({
						tempPaths: this.tempImagePaths,
						path: "posts/images/"
					});

					this.data.images = fileIds;
				}

				if (this.tempVideoPaths.length) {
					let fileIds = await uploadFile({
						tempPaths: this.tempVideoPaths,
						path: "posts/videos/"
					});

					this.data.videos = fileIds;
				}

				this.addData();
			}),

			createVote() {
				this.showVote = !this.showVote;
				// this.$refs.vote.show({
				// 	size: "large",
				// 	type: "custom",
				// 	title: "投票",
				// 	success: res => {

				// 		setTimeout(() => {
				// 			this.$refs.popup.hide();
				// 		}, 200);
				// 	}
				// });
			},
			getVoteValue(e) {
				console.log(e);
				this.voteValue = e;
			},
			chooseDate() {
				let ndate = new Date();
				let dateValue = [ndate.getFullYear() - 1916, ndate.getMonth(), ndate.getDate() + 2, 12, 30];

				this.$refs.popup.show({
					size: "medium",
					type: "date",
					title: "选择截止时间",
					dateIn: {
						value: dateValue,
						cols: ["year", "month", "day", "hour", "minute"],
					},
					disabledTouch: true,
					success: res => {
						// console.log(res);
						this.voteDate = res.timestamp;
						this.$refs.popup.hide();
					}
				});
			},

			// LINK
			editLink() {
				this.$refs.popup.show({
					size: "medium",
					title: "添加网页链接",
					type: "input",
					inputIn: {
						placeholder: "输入网页链接",
						value: this.data.link || "",
						maxlength: -1
					},
					showHandle: true,
					text: "小程序不支持打开外链，需复制链接到浏览器打开",
					success: res => {
						// console.log(res);
						if (isValidUrl(res)) {
							let isHttp = res.startsWith("http://");
							let isHttps = res.startsWith("https://");
							if (!isHttp && !isHttps) {
								res = "http://" + res;
							}
							this.data.link = res;
							this.$refs.popup.hide();
						} else {
							this.$refs.toast.show({
								type: "error",
								text: "请输入有效的链接",
								duration: "2000"
							});
						}
					}
				});
			},
			removeLink() {
				delete this.data.link;
			},

			// LOCATION
			chooseLocation() {
				uni.chooseLocation({
					success: res => {
						console.log(res);
						this.data.location_name = res.name;
						this.data.location = {
							type: "Point",
							coordinates: [
								res.longitude,
								res.latitude
							]
						};
					}
				})
			},
			clearLocation() {
				delete this.data.location_name;
				delete this.data.location;
			},

			// 选择视频
			chooseVideo() {
				if (this.tempImagePaths.length) {
					this.$refs.toast.show({
						type: "info",
						text: "图片视频不可共选",
						duration: "2000"
					});
					return;
				}

				if (this.showVote) {
					this.$refs.toast.show({
						type: "info",
						text: "视频投票不可共选",
						duration: "2000"
					});
					return;
				}

				uni.chooseMedia({
					mediaType: ["video"],
					success: res => {
						let tempFilePaths = res.tempFiles.map(item => {
							return item.tempFilePath
						});

						let arr = [...this.tempVideoPaths, ...tempFilePaths];
						arr = arr.slice(0, 9);
						this.tempVideoPaths = arr;
					}
				})
			},
			removeVideo(index) {
				this.tempVideoPaths.splice(index, 1);
			},

			// 选择图片
			chooseImage() {
				if (this.tempVideoPaths.length) {
					this.$refs.toast.show({
						type: "info",
						text: "图片视频不可共选",
						duration: "2000"
					});
					return;
				}

				if (this.showVote) {
					this.$refs.toast.show({
						type: "info",
						text: "图片投票不可共选",
						duration: "2000"
					});
					return;
				}

				uni.chooseMedia({
					mediaType: ["image"],
					success: res => {
						// console.log(res);

						let tempFilePaths = res.tempFiles.map(item => {
							return item.tempFilePath
						});

						let arr = [...this.tempImagePaths, ...tempFilePaths];
						arr = arr.slice(0, 9);
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

			// INPUT
			getInput(e) {
				// console.log(e.detail);
				this.data.content = e.detail.value;
			},
			onFocus(e) {
				// console.log(e.detail);
				const query = uni.createSelectorQuery().in(this);
				query.select(".textarea").boundingClientRect(data => {
					// console.log(data);
					this.keyboardHeight = e.detail.height;
					this.textareaHeight = `${this.screenHeight - this.keyboardHeight - data.top - 15}px`;
				}).exec();
			},
			onBlur() {
				this.textareaHeight = "100%";
			},

			// 弹窗选择话题
			showTopics() {
				this.$refs.popup.show({
					size: "large",
					type: "checkbox",
					title: "选择话题",
					checks: this.topics,
					success: (res) => {
						// console.log(res);
						this.data.topic_id = res._id;
						this.topic = res.name;
						this.isSelected = true;

						setTimeout(() => {
							this.$refs.popup.hide();
						}, 200);
					}
				});
			},

			// 选择推荐话题
			clickRecTopic(e) {
				let current = this.recTopics[e.index];

				this.topic = current.name;
				this.data.topic_id = current._id;
				this.isSelected = true;

				if (this.recTopics.length == this.recTopicsNum) {
					this.init = current;
					this.recTopics.splice(e.index, 1);
				} else if (this.recTopics.length < this.recTopicsNum) {
					let old = this.init;
					this.init = current;
					this.recTopics.splice(e.index, 1);
					this.recTopics.push(old);
				};

				this.topics.forEach((item, index) => {
					if (this.data.topic_id.indexOf(item._id) !== -1) {
						item.checked = true;
					} else {
						item.checked = false;
					}
				});

				this.scrollLeft = this.old.scrollLeft;
				this.$nextTick(() => {
					this.scrollLeft = 0;
				});
			},

			// 获取话题列表
			async getTopics() {
				let arr = [];
				let res = await db.collection("db-topics").field("_id, name").orderBy("sort desc, post_count desc").get();
				// console.log(res);

				res.result.data.forEach(item => {
					arr.push(item);
				});

				this.topics = arr;
				this.recTopics = arr.slice(0, this.recTopicsNum);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		.title {
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: 80rpx;
			font-size: 45rpx;
			font-weight: bold;
			margin: 25rpx;

			.publish {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 100rpx;
				height: 50rpx;
				background: #333;
				border-radius: 25rpx;
				font-size: 24rpx;
				color: #fff;
			}
		}

		.topic-wrap {
			width: 100%;
			white-space: nowrap;

			.topic-item {
				display: inline-flex;
				min-width: 300rpx;
				height: 100rpx;
				background: #fff;
				border-radius: 15rpx;
				justify-content: space-between;
				align-items: center;
				font-size: 28rpx;
				line-height: 100%;
				color: #666;
				margin-left: 25rpx;
				padding: 0 25rpx;
				transition: background .15s;

				&:last-child {
					margin-right: 25rpx;
				}

				&:active {
					background: #eee;
				}

				&.selected {
					height: 70rpx;
					font-size: 24rpx;
					min-width: 200rpx;
				}

				.iconfont {
					font-size: 28rpx;
					margin-left: 15rpx;
				}
			}
		}

		.main {
			background: #fff;
			border-radius: 15rpx;
			margin: 25rpx;
			padding: 25rpx;

			.body {
				height: 800rpx;
				display: flex;
				flex-direction: column;
				justify-content: space-between;

				.textarea {
					width: 100%;
					height: var(--textarea-height) !important;
					max-height: var(--textarea-height);
					font-size: 30rpx;
					color: #333;
					line-height: 50rpx;
					text-align: justify;
				}

				.wrap {
					.location {
						width: fit-content;
						max-width: 100%;
						display: flex;
						align-items: center;
						background: #f5f5f5;
						border-radius: 10rpx;
						padding: 15rpx;
						margin-top: 25rpx;

						.icon-location-fill {
							font-size: 30rpx;
							color: #999;
						}

						.icon-close-circle-fill {
							font-size: 30rpx;
							color: #ccc;
							margin-left: 15rpx;
						}

						.text {
							margin-left: 10rpx;
							color: #666;
							font-size: 24rpx;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
						}
					}

					.media {
						margin-top: 25rpx;

						.image-wrap,
						.video-wrap {
							position: relative;
						}

						.image,
						.video {
							background: #eee;
							border-radius: 15rpx;
							vertical-align: bottom;
						}

						.image {
							width: 240rpx;
							height: 240rpx;
						}

						.video {
							width: 480rpx;
							height: 270rpx;
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

					.vote {
						margin-top: 25rpx;
					}
				}
			}

			.footer {
				height: 60rpx;
				display: flex;
				justify-content: space-between;
				align-items: center;
				transition: transform .3s;
				margin-top: 25rpx;

				.iconfont {
					font-size: 48rpx;
					color: #666;
				}
			}
		}
	}
</style>