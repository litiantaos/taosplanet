<template>
	<view>
		<post v-if="post.user_id" :data="post" :postId="postId" :isCard="false" :isClick="false" :showMore="true"
			:isCurrentUser="isCurrentUser" :isCollapse="false" @like="clickLike" @more="clickMore" @share="clickShare"></post>

		<view class="avatar-wrap" v-if="likeUsers.length">
			<view class="avatar-group">
				<view v-for="(item, index) in likeUsers" :key="index">
					<cloud-file :src="setAvatar(item.user_id[0])" width="60rpx" height="60rpx" borderRadius="50%"
						border="5rpx solid #fff"></cloud-file>
				</view>
				<view class="avatar-item">···</view>
			</view>
		</view>

		<view style="height: 20rpx; background: #eee;"></view>

		<view class="comment-wrap">
			<view class="title-bar">
				<view class="title">评论</view>
			</view>

			<default-view v-if="!comments.length && showDefault"></default-view>

			<view class="" v-for="(item, index) in comments" :key="index">
				<comment :comment="item" :commentIndex="index" :postUserId="post.user_id[0]._id" @comment="clickComment"
					@reply="clickReply" :ref="'comment' + index">
				</comment>
			</view>

			<load-more v-if="!isLoading && !showDefault" :status="loadMore"></load-more>
		</view>

		<comment-bar :comment="comment" :isAutoFocus="isAutoFocus" :placeholder="placeholder" @toast="showToast"
			@blur="onBlur" @input="onInput" @updated="updated">
		</comment-bar>
	</view>

	<load-view :isLoading="isLoading"></load-view>

	<toast ref="toast"></toast>

	<popup ref="popup"></popup>

	<tooltip ref="tooltip"></tooltip>
</template>

<script>
	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

	import pagesJson from "@/pages.json";

	import {
		setName,
		setAvatar
	} from "@/common/utils.js";

	const db = uniCloud.database();
	const utils = uniCloud.importObject("utils", {
		customUI: true
	});

	export default {
		data() {
			return {
				postId: "",
				post: {},
				likeUsers: [],
				comments: [],
				comment: {
					post_id: "",
					comment_type: 0
				},
				placeholder: "说点什么吧~",
				isAutoFocus: false,
				inputValue: "",
				commentIndex: 0,
				isCurrentUser: false,
				showDefault: true,
				isLoading: true,
				fileUrls: [],
				loadMore: ""
			};
		},
		onLoad(e) {
			if (!e.id) {
				this.paramError("参数有误");
				return;
			}

			this.postId = e.id;
			this.comment.post_id = e.id;

			this.getPost();
		},
		methods: {
			setName,
			setAvatar,
			clickShare() {
				let actions = [{
						text: "转发动态",
						icon: "icon-send-t",
					},
					{
						text: "分享到微信",
						icon: "icon-wechat",
						color: "#2aae67"
					}
				];

				this.$refs.popup.show({
					size: "small",
					type: "action",
					title: "分享",
					actions: actions,
					success: index => {
						if (index == 0) {
							this.$refs.popup.hide();
							uni.navigateTo({
								url: "/pages-post/post-share/post-share"
							});
						} else if (index == 1) {
							this.$refs.tooltip.show();
						}
					}
				});
			},
			getTempFileURL() {
				uniCloud.getTempFileURL({
					fileList: this.post.images
				}).then(res => {
					this.tempFileURL = res.fileList[0].tempFileURL;
				});
			},
			updated() {
				if (this.comment.comment_type == 0) {
					this.showDefault = false;
					this.comments = [];
					this.getComments();
				} else {
					let ref = "comment" + this.commentIndex;
					this.$refs[ref][0].getReplies();
				}

				this.placeholder = "说点什么吧~";
				this.comment.comment_type = 0;
			},
			onInput(e) {
				// console.log(e);
				this.inputValue = e;
			},
			onBlur() {
				if (!this.inputValue) {
					this.placeholder = "说点什么吧~";
					this.comment.comment_type = 0;
				}
				this.isAutoFocus = false;
			},
			showToast(e) {
				this.$refs.toast.show({
					type: e.type,
					text: e.text,
					duration: e.duration
				});
			},
			deleteComment(comment_id) {
				this.$refs.popup.show({
					type: "text",
					title: "提示",
					text: "你确定要删除吗？",
					success: () => {
						this.$refs.toast.show({
							type: "loading",
							text: "正在删除",
							duration: "none"
						})

						db.collection("db-posts-comments").doc(comment_id).remove().then(res => {
							this.$refs.toast.show({
								type: "success",
								text: "删除成功",
								duration: "2000"
							});

							this.$refs.popup.hide();

							this.updated();

							utils.calc("db-posts", "comment_count", this.postId, -1);
						}).catch(err => {
							console.log(err);
							this.$refs.toast.show({
								type: "error",
								text: "删除失败",
								duration: "2000"
							})
						})
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
					let obj = {
						text: "删除",
						icon: "icon-archive-slash",
						color: "#e06c75"
					};

					actions.push(obj);
				}

				return actions;
			},
			clickReply(e) {
				// console.log(e);
				this.commentIndex = e.commentIndex;

				let actions = this.commentActions(e.reply.user_id[0]._id);

				this.$refs.popup.show({
					type: "action",
					title: "操作",
					actions: actions,
					success: index => {
						if (index == 0) {
							this.placeholder = "回复 " + e.reply.user_id[0].nickname;
							this.comment.comment_type = 2;
							this.comment.reply_user_id = e.reply.user_id[0]._id;
							this.comment.reply_comment_id = e.reply.reply_comment_id;
							this.$refs.popup.hide();
							this.isAutoFocus = true;
						} else if (index == 1) {
							this.deleteComment(e.reply._id);
						}
					}
				})
			},
			clickComment(e) {
				// console.log(e);
				this.commentIndex = e.commentIndex;

				let actions = this.commentActions(e.comment.user_id[0]._id);

				this.$refs.popup.show({
					type: "action",
					title: "操作",
					actions: actions,
					success: index => {
						if (index == 0) {
							this.placeholder = "回复 " + e.comment.user_id[0].nickname;
							this.comment.comment_type = 1;
							this.comment.reply_user_id = e.comment.user_id[0]._id;
							this.comment.reply_comment_id = e.comment._id;
							this.$refs.popup.hide();
							this.isAutoFocus = true;
						} else if (index == 1) {
							this.deleteComment(e.comment._id);
						}
					}
				})
			},
			deletePost() {
				this.$refs.popup.show({
					type: "text",
					title: "提示",
					text: "你确定要删除吗？",
					success: () => {
						this.$refs.toast.show({
							type: "loading",
							text: "正在删除",
							duration: "none"
						})

						db.collection("db-posts").doc(this.postId).remove().then(res => {
							// console.log(res);
							utils.calc("db-topics", "post_count", this.post.topic_id[0]._id, -1);
							this.$refs.toast.show({
								type: "success",
								text: "删除成功",
								duration: "2000"
							});

							setTimeout(() => {
								let pages = getCurrentPages();
								let prevPage = pages[pages.length - 2];

								prevPage.$vm.getPosts();

								uni.navigateBack();
							}, 1000)
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
			clickLike() {
				this.$refs.popup.show({
					type: "text",
					title: "提示",
					text: "请登录后再点赞吧！",
					success: () => {
						this.$refs.popup.hide();
						uni.navigateTo({
							url: "/" + pagesJson.uniIdRouter.loginPage
						});
					}
				});
			},

			// 获取评论列表
			async getComments(e) {
				let skip = 0;
				if (e?.isMore) {
					skip = this.comments.length;
				}

				let tempComments = db.collection("db-posts-comments")
					.where(`post_id == "${this.postId}" && comment_type == 0`)
					.orderBy("comment_date desc").skip(skip).limit(10).getTemp();
				let tempUsers = db.collection("uni-id-users").field("_id, avatar_file, nickname").getTemp();

				let resData = [];

				let res = await db.collection(tempComments, tempUsers).get();

				if (e?.isMore) {
					if (res.result.data.length == 0) {
						this.loadMore = "noMore";
					}
					resData = [...this.comments, ...res.result.data];
				} else {
					resData = res.result.data;
					this.loadMore = "";
				}

				let arr = resData.map(item => {
					return item._id
				});

				let replyGroup = await db.collection("db-posts-comments").where({
					comment_type: 1,
					reply_comment_id: db.command.in(arr)
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
				this.showDefault = true;
				this.loadMore = "";
			},

			// 获取点赞的用户
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

				console.log(this.post);

				// 判断当前用户是否为动态作者
				let uid = uniCloud.getCurrentUserInfo().uid;

				if (uid == this.post.user_id[0]._id) {
					this.isCurrentUser = true;
				}

				this.updateViewCount();
				this.getLikeUsers();
				this.getComments();
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
		onReachBottom() {
			this.loadMore = "loading";
			if (this.loadMore == "noMore") return;
			this.getComments({
				isMore: true
			});
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

		.avatar-group {
			display: flex;
			align-items: center;

			.avatar-item {
				width: 60rpx;
				height: 60rpx;
				border-radius: 50%;
				border: 5rpx solid #fff;
				background: #eee;
				overflow: hidden;

				&:not(:first-child) {
					margin-left: -20rpx;
				}

				&:last-child {
					font-size: 20rpx;
					font-weight: bold;
					color: #666;
					display: flex;
					justify-content: center;
					align-items: center;
				}
			}
		}
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