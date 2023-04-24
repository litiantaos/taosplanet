<template>
	<view>
		<nav-bar background="rgba(0,0,0,0)"></nav-bar>

		<view class="header">
			<view class="wallpaper"></view>
			<view class="title">{{topic.name}}</view>
		</view>

		<view class="container">
			<view v-for="(item, index) in posts" :key="index">
				<post :data="item" :postId="item._id" @likeLogin="needLogin" @share="clickShare"></post>
			</view>

			<load-more v-if="!isLoading" :status="loadMore"></load-more>
		</view>

		<safe-area type="bottom"></safe-area>
	</view>

	<load-view :isLoading="isLoading"></load-view>
	<popup ref="popup"></popup>
	<share-handler ref="share"></share-handler>
</template>

<script>
	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

	import {
		checkLikes
	} from "@/common/cloud.js";

	const db = uniCloud.database();

	export default {
		data() {
			return {
				topicId: "",
				loadMore: "",
				noMore: false,
				isLoading: true,
				posts: [],
				topic: {}
			};
		},
		onLoad(e) {
			if (e.id) {
				this.topicId = e.id;
				this.getTopic();
				this.getPosts();
			}
		},
		methods: {
			getTopic() {
				db.collection("db-topics").where(`_id == "${this.topicId}"`).get().then(res => {
					// console.log(res);
					this.topic = res.result.data[0];
				});
			},
			async getPosts(e = {}) {
				const {
					loadMore = false
				} = e;

				let skip = 0;
				if (loadMore) {
					skip = this.posts.length;
				}

				let tempPosts = db.collection("db-posts").where(`sec_check != 1 && topic_id == "${this.topicId}"`)
					.orderBy("sort desc, last_modify_date desc").skip(skip).limit(20).getTemp();
				let tempUsers = db.collection("uni-id-users").field("_id, avatar_file, nickname, intro").getTemp();
				let tempTopics = db.collection("db-topics").field("_id, name").getTemp();

				let res = await db.collection(tempPosts, tempUsers, tempTopics).get();

				let resData = [];

				if (loadMore) {
					if (res.result.data.length == 0) {
						this.noMore = true;
					}
					resData = [...this.posts, ...res.result.data];
				} else {
					this.posts = [];
					resData = res.result.data;
					this.noMore = false;
				}

				if (store.hasLogin) {
					await checkLikes(resData).then(result => {
						resData = result;
					});
				}

				this.posts = resData;
				console.log(this.posts);

				this.loadMore = "";

				setTimeout(() => {
					this.isLoading = false;
					uni.stopPullDownRefresh();
				}, 500);
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
			clickShare() {
				this.$refs.share.handleShare();
			},
		},
		onReachBottom() {
			this.loadMore = "loading";
			if (this.noMore) {
				setTimeout(() => {
					this.loadMore = "noMore";
				}, 500);
				return;
			};
			this.getPosts({
				loadMore: true
			});
		},
		onPullDownRefresh() {
			this.getPosts();
		}
	}
</script>

<style lang="scss" scoped>
	.header {
		width: 100%;
		height: 400rpx;
		position: relative;

		.wallpaper {
			width: 100%;
			height: 100%;
			background: #fff;
		}

		.title {
			position: absolute;
			bottom: 25rpx;
			left: 25rpx;
			font-size: 42rpx;
			font-weight: bold;
		}
	}

	.container {
		padding: 25rpx;
	}
</style>