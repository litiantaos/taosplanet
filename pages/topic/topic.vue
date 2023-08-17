<template>
	<view>
		<nav-bar></nav-bar>
		<safe-area></safe-area>

		<view class="title" :style="{top: navHeight + 'px'}">{{topic.name}}</view>

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
				isLoading: true,
				loadMore: "",
				noMore: false,
				posts: [],
				topic: {},
				navHeight: 0
			};
		},
		onLoad(e) {
			if (e.id) {
				this.topicId = e.id;
				this.getTopic();
				this.getPosts();
			}

			let {
				statusBarHeight
			} = getApp().globalData.systemInfo;

			this.navHeight = statusBarHeight + 44;
		},
		methods: {
			getTopic() {
				db.collection("db-topics").where(`_id == "${this.topicId}"`).get().then(res => {
					// console.log(res);
					this.topic = res.result.data[0];
				});
			},
			async getPosts() {
				let tempPosts = db.collection("db-posts").where(`sec_check != 1 && topic_id == "${this.topicId}"`)
					.orderBy("sort desc, last_modify_date desc").skip(this.posts.length).limit(10).getTemp();
				let tempUsers = db.collection("uni-id-users").field("_id, avatar_file, nickname, intro").getTemp();
				let tempTopics = db.collection("db-topics").field("_id, name").getTemp();

				let res = await db.collection(tempPosts, tempUsers, tempTopics).get();

				let newData = res.result.data;

				if (newData.length == 0) {
					this.noMore = true;
					this.loadMore = "noMore";
					return;
				}

				if (store.hasLogin) {
					await checkLikes(newData).then(result => {
						newData = result;
					});
				}

				let resData = [...this.posts, ...newData];

				this.posts = resData;
				// console.log(this.posts);

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
				this.loadMore = "noMore";
				return;
			};
			this.getPosts();
		},
		onPullDownRefresh() {
			this.getPosts();
		}
	}
</script>

<style lang="scss" scoped>
	.title {
		position: sticky;
		height: 100rpx;
		display: flex;
		align-items: center;
		font-size: 45rpx;
		font-weight: bold;
		padding: 25rpx;
		background: #f5f5f5;
		z-index: 990;
	}

	.container {
		padding: 25rpx;
	}
</style>