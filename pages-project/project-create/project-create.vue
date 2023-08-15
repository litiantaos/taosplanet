<template>
	<view class="container">
		<view class="input-wrap">
			<input class="input" type="text" v-model="inputVal" placeholder="项目标题" placeholder-class="placeholder-class"
				@input="onInput" />
			<view class="fun-btn">
				<view class="" @click="editIndustry">{{data.industry_name ? data.industry_name : "选择行业"}}</view>
				<i class="iconfont icon-arrow-right"></i>
			</view>
		</view>

		<editor id="editor" placeholder="项目介绍" @ready="onEditorReady" @focus="onFocus" @blur="onBlur"
			@statuschange="onStatusChange" show-img-toolbar>
		</editor>

		<view v-if="isToolShow" class="toolbar" :style="{bottom: `${height}px`}">
			<view class="iconfont icon-header" :class="{'active': isHeader}" @click="onHeader"></view>
			<view class="iconfont icon-bold" :class="{'active': isBold}" @click="onBold"></view>
			<view class="iconfont icon-list-u" :class="{'active': isListBullet}" @click="onListBullet"></view>
			<view class="iconfont icon-list-o" :class="{'active': isListOrdered}" @click="onListOrdered"></view>
			<view class="iconfont icon-gallery" @click="onImage"></view>
			<view class="iconfont icon-doc" @click="onFile"></view>
		</view>

		<view v-if="Object.keys(tempFile).length != 0" class="file-card" @click="openFile">
			<view class="left">{{tempFile.ext}}</view>
			<view class="right">
				<view class="name">{{tempFile.name}}</view>
				<view class="size">{{tempFile.size}} {{fileStatus}}</view>
			</view>
			<view class="remove iconfont icon-close-circle-fill" @click.stop="removeFile"></view>
		</view>

		<view class="confirm-wrap">
			<view v-if="data.title && data.industry_name" class="confirm-btn iconfont icon-tick" @click="onConfirm">
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
		throttle
	} from "@/common/utils.js";

	import {
		uploadFile,
		checkContent,
		checkMedia,
		getTempFileURL,
		replaceImgSrc
	} from "@/common/cloud.js";

	const db = uniCloud.database();

	export default {
		data() {
			return {
				isToolShow: false,
				isHeader: false,
				isBold: false,
				isListBullet: false,
				isListOrdered: false,
				keyboardHeight: 0,
				height: 0,
				tempFile: {},
				images: [],
				data: {},
				editId: "",
				inputVal: "",
				fileStatus: "",
				srcMap: {}
			};
		},
		onLoad(e) {
			uni.onKeyboardHeightChange(res => {
				// console.log(res);
				this.keyboardHeight = res.height;
				if (this.keyboardHeight > 0) {
					uni.pageScrollTo({
						scrollTop: 0
					})
				}
			});

			if (e.id) {
				this.editId = e.id;
				this.setData();
			}
		},
		methods: {
			async setData() {
				const res = await db.collection("db-projects").where(`_id == "${this.editId}"`).get();

				const resData = res.result.data[0];
				console.log(resData);

				this.inputVal = resData.title;
				this.data.title = resData.title;

				const {
					nHtml,
					srcMap
				} = await replaceImgSrc(resData.content, "getTempFileURL");

				this.editorCtx.setContents({
					html: nHtml
				});
				this.data.content = resData.content;

				this.srcMap = srcMap;
				console.log(srcMap);

				this.data.industry_id = resData.industry_id;
				this.data.industry_name = resData.industry_name;

				if (resData.file) {
					const url = await getTempFileURL([resData.file.path]);

					this.tempFile = resData.file;
					this.tempFile.path = url[0];
					this.data.file = resData.file;
				}
			},
			afterAddData(id) {
				if (this.data.sec_check && this.data.sec_check == 1) {
					this.$refs.toast.show({
						type: "error",
						text: "内容违规，待人工审核",
						duration: "2000"
					});
				} else {
					this.$refs.toast.show({
						type: "success",
						text: "提交成功",
						duration: "2000"
					});
				}

				setTimeout(() => {
					uni.navigateTo({
						url: "/pages-project/project-transfer/project-transfer?id=" + id + "&userId=" + store.userInfo._id
					});
				}, 1000);
			},
			async addData() {
				// 文本安全检测
				await checkContent(this.data.title).then(res => {
					console.log(res);
					if (res == 1) {
						this.data.sec_check = 1;
					}
				});

				await checkContent(this.data.content).then(res => {
					console.log(res);
					if (res == 1) {
						this.data.sec_check = 1;
					}
				});

				if (this.images.length) {
					// 图片安全检测
					this.images.map(async item => {
						await checkMedia(item).then(res => {
							console.log(res);
							if (res == 1) {
								this.data.sec_check = 1;
								return;
							}
						});
					});
				}

				if (this.editId) {
					db.collection("db-projects").where(`_id == "${this.editId}"`).update({
						...this.data,
						is_modified: true,
						last_modify_date: db.getCloudEnv("$cloudEnv_now"),
						last_modify_ip: db.getCloudEnv("$cloudEnv_clientIP")
					}).then(res => {
						console.log("update", res);
						this.afterAddData(this.editId);
					})
				} else {
					db.collection("db-projects").add(this.data).then(async res => {
						console.log("add", res);
						this.afterAddData(res.result.id);
					});
				}
			},

			onConfirm: throttle(async function() {
				this.$refs.toast.show({
					type: "loading",
					text: "提交中",
					duration: "none"
				});

				this.editorCtx.getContents({
					success: async res => {
						const {
							nHtml,
							nSrcs
						} = await replaceImgSrc(res.html, "uploadFile", true, "projects/images/");

						let newHtml = nHtml;

						if (this.srcMap && Object.keys(this.srcMap).length != 0) {
							// 将临时链接替换为原fileId
							const imgRegex = /<img[^>]*>/gi;
							const imgTags = nHtml.match(imgRegex);

							imgTags.forEach(tag => {
								const src = tag.match(/src="([^"]+)"/)[1];
								if (src in this.srcMap) {
									newHtml = newHtml.replace(tag, tag.replace(src, this.srcMap[src]));
								}
							});
						}

						this.data.content = newHtml;

						if (nSrcs) {
							this.images = nSrcs;
						}

						this.data.excerpt = res.text.slice(0, 50);

						const pattern = /^http:\/\/tmp\//;
						const path = this.tempFile.path;

						console.log(Object.keys(this.tempFile).length != 0, pattern.test(path), path);

						if (Object.keys(this.tempFile).length != 0 && pattern.test(path)) {
							let urls = await uploadFile({
								tempPaths: [path],
								path: "projects/files/"
							});

							this.data.file = this.tempFile;
							this.data.file.path = urls[0];
							console.log("data", this.data);
						}

						this.addData();
					}
				});
			}),
			onInput(e) {
				// console.log(e);
				let val = e.detail.value;
				this.data.title = val;
			},
			editIndustry() {
				let selectorIn = {
					tabs: ["全部"],
					levels: 2,
					db: {
						col: "industries",
						field: "_id, name, level, parent_id",
						orderBy: "number_of_users desc"
					}
				};

				this.$refs.popup.show({
					size: "medium",
					type: "picker",
					title: "选择行业",
					pickerIn: {
						tabs: ["全部"],
						levels: 2,
						col: "db-industries",
						levelField: "type",
						parentField: "parent_code",
						field: "_id, code, name, type",
						orderBy: "code"
					},
					success: (res) => {
						console.log(res);

						this.data.industry_id = res[1].id;
						this.data.industry_name = res[1].name;

						this.$refs.popup.hide();
					}
				});
			},
			onEditorReady() {
				uni.createSelectorQuery().in(this).select('#editor').context((res) => {
					this.editorCtx = res.context;
				}).exec();
			},
			onHeader() {
				this.isHeader = !this.isHeader;
				this.editorCtx.format("header", this.isHeader ? "H2" : false);
			},
			onBold() {
				this.isBold = !this.isBold;
				this.editorCtx.format("bold");
			},
			onListBullet() {
				this.isListBullet = !this.isListBullet;
				this.editorCtx.format("list", "bullet");
			},
			onListOrdered() {
				this.isListOrdered = !this.isListOrdered;
				this.editorCtx.format("list", "ordered");
			},
			onImage() {
				uni.chooseMedia({
					mediaType: ["image"],
					sourceType: ["album"],
					success: res => {
						console.log(res);
						res.tempFiles.map(item => {
							this.editorCtx.insertImage({
								src: item.tempFilePath
							});
						});
					}
				});
			},
			formatSize(size) {
				const units = ['B', 'KB', 'MB', 'GB'];
				let i = 0;
				while (size >= 1024) {
					size /= 1024;
					i++;
				}
				return `${size.toFixed(2)} ${units[i]}`;
			},
			splitStr(str) {
				const index = str.lastIndexOf('.');
				return [
					str.substring(0, index),
					str.substring(index + 1)
				];
			},
			onFile() {
				this.$refs.popup.show({
					type: "text",
					title: "提示",
					text: "因微信限制，仅可选择微信聊天文件，支持格式为 PDF、PPT、DOC。",
					success: () => {
						this.$refs.popup.hide();
						uni.chooseMessageFile({
							count: 1,
							type: "file",
							extension: [".pdf", ".ppt", ".doc"],
							success: res => {
								console.log(res);
								let obj = res.tempFiles[0];
								let tempFile = obj;
								tempFile.size = this.formatSize(obj.size);
								let str = this.splitStr(obj.name);
								tempFile.name = str[0];
								tempFile.ext = str[1].toUpperCase();
								this.tempFile = tempFile;
							}
						});
					}
				});
			},
			openFile() {
				let path = this.tempFile.path;
				const pattern = /^http:\/\/tmp\//;

				if (!pattern.test(path)) {
					this.fileStatus = "下载中";
					uni.downloadFile({
						url: path,
						success: res => {
							path = res.tempFilePath;
							this.fileStatus = "";
						}
					});
				}

				uni.openDocument({
					filePath: path,
					showMenu: true,
					success: res => {
						console.log(res);
					}
				});
			},
			removeFile() {
				if (Object.keys(this.tempFile).length != 0) {
					this.tempFile = {};
				}
			},
			checkStatus(name, value, detail, obj) {
				if (detail.hasOwnProperty(name) && detail[name] == value) {
					this[obj] = true;
				} else {
					this[obj] = false;
				}
			},
			onStatusChange(e) {
				// console.log(e);
				this.checkStatus("header", "2", e.detail, "isHeader");
				this.checkStatus("bold", "strong", e.detail, "isBold");
				this.checkStatus("list", "bullet", e.detail, "isListBullet");
				this.checkStatus("list", "ordered", e.detail, "isListOrdered");
			},
			onFocus() {
				this.isToolShow = true;
				this.height = this.keyboardHeight;
			},
			onBlur() {
				this.isToolShow = false;
				this.height = 0;
			}
		}
	}
</script>

<style>
	page {
		background: #fff;
	}

	.placeholder-class {
		color: #ccc;
	}

	.ql-blank::before {
		font-style: normal !important;
		color: #ccc !important;
	}
</style>

<style lang="scss" scoped>
	.container {
		padding: 25rpx;

		.input-wrap {
			height: 100rpx;
			border-bottom: 2rpx solid #eee;
			display: flex;
			align-items: center;
			justify-content: space-between;

			.input {
				flex: 1;
				margin-right: 20rpx;
			}
		}

		#editor {
			height: calc(100vh - 500rpx);
			margin-top: 25rpx;
			color: #333;
		}

		.toolbar {
			display: flex;
			justify-content: space-around;
			align-items: center;
			width: 100%;
			height: 90rpx;
			background: #f5f5f5;
			position: fixed;
			left: 0;
			z-index: 999;

			.iconfont {
				font-size: 45rpx;
				color: #666;

				&.active {
					font-weight: bold;
					color: #333;
				}
			}
		}

		.file-card {
			width: 450rpx;
			height: 100rpx;
			border-radius: 20rpx;
			margin-top: 25rpx;
			display: flex;
			align-items: center;
			overflow: hidden;
			background: #eee;

			.left {
				flex: 0 0 100rpx;
				height: 100%;
				background: #666;
				color: #fff;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 24rpx;
				font-weight: bold;
			}

			.right {
				flex: 1;
				height: 100%;
				padding: 15rpx 20rpx;
				display: flex;
				flex-direction: column;
				justify-content: space-around;

				.name {
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 1;
					-webkit-box-orient: vertical;
					font-size: 26rpx;
					color: #333;
				}

				.size {
					font-size: 24rpx;
					color: #666;
				}
			}

			.remove {
				color: #666;
				margin-right: 20rpx;
			}
		}
	}

	.fun-btn {
		font-size: 26rpx;
		color: #666;
		padding: 0 25rpx;
		background: #eee;
		height: 60rpx;
		width: fit-content;
		border-radius: 30rpx;
		line-height: 60rpx;
		display: flex;
		align-items: center;

		.iconfont {
			margin-left: 15rpx;
		}
	}

	.confirm-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 50rpx;

		.confirm-btn {
			width: 90rpx;
			height: 90rpx;
			background: #333;
			border-radius: 50%;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 36rpx;
			color: #fff;
		}
	}
</style>