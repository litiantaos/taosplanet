<template>
	<view>
		<post v-if="post.user_id" :data="post" :postId="postId" :isCard="false" :isClick="false" :showMore="true"
			:isCurrentUser="isCurrentUser" :isCollapse="false" @likeLogin="needLogin" @more="clickMore" @share="clickShare"
			@voteLogin="needLogin" @voteDate="voteDate">
		</post>

		<view class="avatar-wrap" v-if="likeUsers.length">
			<avatar-group :avatars="likeUsers"></avatar-group>
		</view>

		<view style="height: 20rpx; background: #eee;"></view>

		<view class="comment-wrap">
			<view class="title-bar">
				<view class="title">评论</view>
			</view>

			<default-view v-if="!comments.length"></default-view>

			<view v-for="(comment, commentIndex) in comments" :key="comment._id">
				<comment :data="comment" :postData="postData" @onComment="$event => clickComment(comment, commentIndex)"
					@likeLogin="needLogin" :ref="'comment' + commentIndex" v-slot="{replies}">

					<view v-for="(reply, replyIndex) in replies" :key="reply._id">
						<comment :type="1" :data="reply" :postData="postData"
							@onComment="$event => clickReply(reply, commentIndex, replyIndex)" @likeLogin="needLogin">
						</comment>
					</view>

				</comment>
			</view>

			<load-more v-if="!isLoading && comments.length" :status="loadMore"></load-more>
		</view>

		<send-view :placeholder="placeholder" :focus="isFocus" :mediaType="['image']" :mediaCount="2" @input="onInput"
			@send="sendComment" @blur="onBlur" ref="sendView">
		</send-view>
	</view>

	<load-view background="#fff" :isLoading="isLoading"></load-view>

	<popup ref="popup"></popup>
	<toast ref="toast"></toast>

	<share-handler ref="share"></share-handler>
</template>

<script>
	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

	import {
		checkCommentsLikes,
		uploadFile,
		checkContent,
		checkMedia
	} from "@/common/cloud.js";

	import pagesJson from "@/pages.json";

	const db = uniCloud.database();
	const dbCmd = db.command;
	const utils = uniCloud.importObject("utils", {
		customUI: true
	});
	const pushMsg = uniCloud.importObject("push-msg", {
		customUI: true
	});

	export default {
		data() {
			return {
				postId: "",
				post: {},
				likeUsers: [],
				comments: [],
				sendData: {
					post_id: "",
					comment_type: 0
				},
				placeholder: "说点什么吧~",
				isFocus: false,
				inputValue: "",
				commentIndex: 0,
				isCurrentUser: false,
				isLoading: true,
				fileUrls: [],
				loadMore: "",
				noMore: false,
				postData: {},
				replyUserName: ""
			};
		},
		onLoad(e) {
			if (!e.id) {
				this.paramError("参数有误");
				return;
			}

			this.postId = e.id;
			this.sendData.post_id = e.id;

			this.getPost();
		},
		methods: {
			async sendComment(e) {
				this.$refs.toast.show({
					type: "loading",
					text: "发布中",
					duration: "none"
				});

				if (e.value) {
					this.sendData.comment_content = e.value;

					// 文本安全检测
					await checkContent(this.sendData.comment_content).then(res => {
						console.log(res);
						if (res == 1) {
							this.sendData.sec_check = 1;
						}
					});
				}

				if (e.images && e.images.length) {
					let fileIds = await uploadFile({
						tempPaths: e.images,
						path: "comments/images/"
					});

					this.sendData.comment_images = fileIds;

					// 图片安全检测
					fileIds.map(async item => {
						await checkMedia(item).then(res => {
							console.log(res);
							if (res == 1) {
								this.sendData.sec_check = 1;
								return;
							}
						});
					});
				}

				db.collection("db-posts-comments").add(this.sendData).then(async res => {
					// console.log(res);

					utils.calc("db-posts", "comment_count", this.sendData.post_id, 1);

					if (this.sendData.sec_check && this.sendData.sec_check == 1) {
						this.$refs.toast.show({
							type: "error",
							text: "内容违规，待人工审核",
							duration: "2000"
						});
					} else {
						if (this.sendData.comment_type == 0) {
							let pushParam = {
								type: "comment",
								content: "评论了你的动态",
								excerpt: this.sendData.comment_content.substr(0, 25),
								post_id: this.postId,
								user_id: this.post.user_id[0]._id,
								from_user_id: store.userInfo._id,
								from_user_name: store.userInfo.nickname,
								from_user_avatar: store.userInfo.avatar_file?.url,
								date: Date.now()
							};

							await utils.addData("db-messages", pushParam).then(res => {
								pushParam._id = res.id;
							});

							pushMsg.sendMsg({
								user_id: this.post.user_id[0]._id,
								payload: pushParam
							});
						} else if (this.sendData.comment_type == 1) {
							let pushParam = {
								type: "reply",
								content: "回复了你的评论",
								excerpt: this.sendData.comment_content.substr(0, 25),
								post_id: this.postId,
								user_id: this.sendData.reply_user_id,
								from_user_id: store.userInfo._id,
								from_user_name: store.userInfo.nickname,
								from_user_avatar: store.userInfo.avatar_file?.url,
								date: Date.now()
							};

							await utils.addData("db-messages", pushParam).then(res => {
								pushParam._id = res.id;
							});

							pushMsg.sendMsg({
								user_id: this.sendData.reply_user_id,
								payload: pushParam
							});
						}

						this.afterSend(res.result.id);

						this.$refs.toast.show({
							type: "success",
							text: "发布成功",
							duration: "2000"
						});
					}

					this.resetSend();
				});
			},
			resetSend() {
				this.placeholder = "说点什么吧~";
				this.sendData.comment_type = 0;
				this.$refs.sendView.reset();
			},
			afterSend(id) {
				if (this.sendData.comment_type == 0) {
					this.comments = [];
					this.getComments();
				} else {
					let ref = "comment" + this.commentIndex;
					this.$refs[ref][0].addSend(this.sendData, id, this.replyUserName);
				}
			},
			onBlur() {
				if (!this.inputValue) {
					this.placeholder = "说点什么吧~";
					this.sendData.comment_type = 0;
					this.$refs.sendView.reset();
				}
				this.isFocus = false;
			},
			onInput(e) {
				// console.log(e);
				this.inputValue = e;
			},
			voteDate() {
				this.$refs.toast.show({
					type: "info",
					text: "投票已结束",
					duration: "2000"
				});
			},
			clickShare() {
				this.$refs.share.handleShare();
			},
			showToast(e) {
				this.$refs.toast.show({
					type: e.type,
					text: e.text,
					duration: e.duration
				});
			},
			afterDelete(type, index) {
				if (type == 0) {
					this.comments.splice(index, 1);
				} else {
					let ref = "comment" + this.commentIndex;
					this.$refs[ref][0].deleteSend(index);
				}
			},
			deleteComment(id, type, index) {
				this.$refs.popup.show({
					type: "text",
					title: "提示",
					text: "你确定要删除吗？",
					success: () => {
						this.$refs.toast.show({
							type: "loading",
							text: "正在删除",
							duration: "none"
						});

						db.collection("db-posts-comments").doc(id).remove().then(async res => {
							if (type == 0) {
								await db.collection("db-posts-comments").where(`reply_comment_id == "${id}"`).remove();
							}

							this.afterDelete(type, index);

							this.$refs.toast.show({
								type: "success",
								text: "删除成功",
								duration: "2000"
							});

							this.$refs.popup.hide();

							utils.calc("db-posts", "comment_count", this.postId, -1);
						}).catch(err => {
							console.log(err);
							this.$refs.toast.show({
								type: "error",
								text: "删除失败",
								duration: "2000"
							});
						});
					}
				})
			},
			commentActions(id) {
				let uid = uniCloud.getCurrentUserInfo().uid;

				let actions = [{
					text: "回复",
					icon: "icon-message",
				}];

				if (uid == id) {
					actions.push({
						text: "删除",
						icon: "icon-archive-slash",
						color: "#e06c75"
					});
				}

				return actions;
			},
			clickReply(reply, commentIndex, replyIndex) {
				this.commentIndex = commentIndex;

				let actions = this.commentActions(reply.user_id[0]._id);

				this.$refs.popup.show({
					type: "action",
					title: "操作",
					actions: actions,
					success: index => {
						if (index == 0) {
							this.placeholder = "回复 " + reply.user_id[0].nickname;
							this.sendData.comment_type = 2;
							this.sendData.reply_user_id = reply.user_id[0]._id;
							this.sendData.reply_comment_id = reply.reply_comment_id;
							this.$refs.popup.hide();
							this.isFocus = true;
							this.replyUserName = reply.user_id[0].nickname;
						} else if (index == 1) {
							this.deleteComment(reply._id, 1, replyIndex);
						}
					}
				});
			},
			clickComment(comment, commentIndex) {
				this.commentIndex = commentIndex;

				let actions = this.commentActions(comment.user_id[0]._id);

				this.$refs.popup.show({
					type: "action",
					title: "操作",
					actions: actions,
					success: index => {
						if (index == 0) {
							this.placeholder = "回复 " + comment.user_id[0].nickname;
							this.sendData.comment_type = 1;
							this.sendData.reply_user_id = comment.user_id[0]._id;
							this.sendData.reply_comment_id = comment._id;
							this.$refs.popup.hide();
							this.isFocus = true;
						} else if (index == 1) {
							this.deleteComment(comment._id, 0, commentIndex);
						}
					}
				})
			},

			// 获取评论列表
			async getComments() {
				let tempComments = db.collection("db-posts-comments")
					.where(`post_id == "${this.postId}" && comment_type == 0`)
					.orderBy("comment_date desc").skip(this.comments.length).limit(10).getTemp();
				let tempUsers = db.collection("uni-id-users").field("_id, avatar_file, nickname").getTemp();

				let res = await db.collection(tempComments, tempUsers).get();

				let newData = res.result.data;

				if (newData.length == 0) {
					this.noMore = true;
					this.loadMore = "noMore";
					return;
				}

				if (store.hasLogin) {
					await checkCommentsLikes(newData).then(result => {
						newData = result;
					});
				}

				let resData = [...this.comments, ...newData];

				// 回复计数
				let arr = resData.map(item => {
					return item._id
				});

				let replyGroup = await db.collection("db-posts-comments").where({
					comment_type: dbCmd.neq(0),
					reply_comment_id: dbCmd.in(arr)
				}).groupBy("reply_comment_id").groupField("count(*) as replyCount").get();

				resData.forEach(item => {
					let index = replyGroup.result.data.findIndex(find => {
						return find.reply_comment_id == item._id;
					});

					if (index > -1) {
						item.replyCount = replyGroup.result.data[index].replyCount;
					}
				});

				this.comments = resData;
				this.isLoading = false;

				setTimeout(() => {
					uni.stopPullDownRefresh();
				}, 300);
			},

			deletePost() {
				this.$refs.popup.show({
					type: "text",
					title: "提示",
					text: "动态内容、获赞、评论均会被删除，确定要继续吗？",
					success: () => {
						this.$refs.toast.show({
							type: "loading",
							text: "正在删除",
							duration: "none"
						})

						db.collection("db-posts").doc(this.postId).remove().then(async res => {
							// console.log(res);
							utils.calc("db-topics", "post_count", this.post.topic_id[0]._id, -1);

							// 删除云文件
							if (this.post.images?.length) {
								utils.deleteFile({
									fileList: this.post.images
								});
							} else if (this.post.videos?.length) {
								utils.deleteFile({
									fileList: this.post.videos
								});
							}

							// 删除赞
							let likesDb = db.collection("db-posts-likes").where(`post_id == "${this.postId}"`);
							await likesDb.count().then(res => {
								if (res.result.total != 0) {
									likesDb.remove();
								}
							});

							// 删除评论
							let commentDb = db.collection("db-posts-comments").where(`post_id == "${this.postId}"`);
							await commentDb.count().then(res => {
								if (res.result.total != 0) {
									commentDb.remove();
								}
							});

							if (this.post.vote_end_date) {
								await db.collection("db-votes-options").where(`post_id == "${this.postId}"`).remove();
								await db.collection("db-votes").where(`post_id == "${this.postId}"`).remove();
							}

							this.$refs.toast.show({
								type: "success",
								text: "删除成功",
								duration: "2000"
							});

							setTimeout(() => {
								// let pages = getCurrentPages();
								// let prevPage = pages[pages.length - 2];

								// prevPage.$vm.getPosts();

								// uni.navigateBack();

								uni.reLaunch({
									url: '/pages/index/index'
								});
							}, 1000);
						}).catch(err => {
							console.log(err);
							this.$refs.toast.show({
								type: "error",
								text: "删除失败",
								duration: "2000"
							});
						});
					}
				});
			},
			clickMore() {
				this.$refs.popup.show({
					type: "action",
					title: "更多操作",
					actions: [{
							text: "编辑",
							icon: "icon-edit"
						},
						{
							text: "删除",
							icon: "icon-archive-slash",
							color: "#E06C75"
						},
					],
					success: index => {
						if (index == 0) {
							uni.setStorageSync("post-edit", {
								_id: this.post._id._value,
								content: this.post.content
							});
							uni.navigateTo({
								url: "/pages-post/post-edit/post-edit"
							});
						} else if (index == 1) {
							this.deletePost();
						}
					}
				})
			},
			needLogin() {
				this.$refs.popup.show({
					type: "text",
					title: "提示",
					text: "请登录后再继续吧！",
					success: () => {
						this.$refs.popup.hide();
						uni.navigateTo({
							url: "/" + pagesJson.uniIdRouter.loginPage
						});
					}
				});
			},

			// 获取点赞的用户头像
			getLikeUsers() {
				let tempLikes = db.collection("db-posts-likes").where(`post_id == "${this.postId}"`)
					.orderBy("date desc").limit(5).getTemp();
				let tempUsers = db.collection("uni-id-users").field("_id, avatar_file").getTemp();

				db.collection(tempLikes, tempUsers).get().then(res => {
					this.likeUsers = res.result.data.reverse();
				})
			},

			// 更新浏览量
			updateViewCount() {
				utils.calc("db-posts", "view_count", this.postId, 1).then(res => {
					// console.log(res);
				});
			},

			// 获取动态内容
			async getPost() {
				let tempPost = db.collection("db-posts").where(`_id == "${this.postId}"`).getTemp();
				let tempUser = db.collection("uni-id-users").field("_id, avatar_file, nickname, intro").getTemp();
				let tempTopic = db.collection("db-topics").getTemp();

				let tempArr = [tempPost, tempUser, tempTopic];

				// 增加点赞表查询
				if (store.hasLogin) {
					let tempLike = db.collection("db-posts-likes")
						.where(`post_id == "${this.postId}" && user_id == $cloudEnv_uid`)
						.getTemp();

					tempArr.push(tempLike);
				}

				let res = await db.collection(...tempArr).get();

				let resData = res.result.data[0];

				// 增加点赞状态
				let isLike = false;

				if (store.hasLogin) {
					isLike = resData._id["db-posts-likes"].length ? true : false;
				}

				resData.isLike = isLike;

				this.post = resData;
				// console.log(this.post);

				this.isLoading = false;

				// 判断当前用户是否为动态作者
				let uid = uniCloud.getCurrentUserInfo().uid;

				if (uid == this.post.user_id[0]._id) {
					this.isCurrentUser = true;
				}

				this.updateViewCount();
				this.getLikeUsers();
				this.getComments();

				this.postData = {
					post_id: this.postId,
					user_id: this.post.user_id[0]._id
				}
			},
			paramError(param) {
				this.$refs.toast.show({
					type: "error",
					text: param
				});

				setTimeout(() => {
					uni.reLaunch({
						url: "/pages/index/index"
					});
				}, 1000);
			},
		},
		onPullDownRefresh() {
			this.isLoading = true;
			setTimeout(() => {
				this.post = {};
				this.comments = [];
				this.getPost();
			}, 300);
		},
		onReachBottom() {
			this.loadMore = "loading";
			if (this.noMore) {
				this.loadMore = "noMore";
				return;
			};
			this.getComments();
		},
		onShareAppMessage() {
			return {
				title: this.post.content,
				path: "/pages-post/post-detail/post-detail?id=" + this.postId,
				imageUrl: this.fileUrls[0]
			}
		},
		onShareTimeline() {
			return {
				title: this.post.content,
				query: "id=" + this.postId + "&from=timeline",
				imageUrl: this.fileUrls[0]
			}
		}
	}
</script>

<style>
	page {
		background: #fff;
	}
</style>

<style lang="scss" scoped>
	.avatar-wrap {
		display: flex;
		justify-content: center;
		margin-bottom: 25rpx;
	}

	.comment-wrap {
		background: #fff;
		padding: 25rpx;
		padding-bottom: calc(env(safe-area-inset-bottom) + 120rpx);

		.title-bar {
			width: 100%;
			height: 50rpx;
			font-size: 36rpx;
			font-weight: bold;
			margin-bottom: 40rpx;
			display: flex;
			align-items: center;
		}

		.load-more {
			display: flex;
			justify-content: center;
			padding: 20rpx;
			font-size: 24rpx;
			color: #999;
		}
	}
</style>