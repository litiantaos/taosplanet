<template>
	<view class="container">
		<view v-for="(item, index) in posts" :key="index">
			<post :data="item" :postId="item._id" @share="clickShare"></post>
		</view>
	</view>

	<load-view :isLoading="isLoading"></load-view>
	<share-handler ref="share"></share-handler>
</template>

<script>
	const db = uniCloud.database();
	const dbCmd = db.command;

	export default {
		data() {
			return {
				posts: [],
				isLoading: true
			};
		},
		onLoad() {
			this.getPosts()
		},
		methods: {
			clickShare() {
				this.$refs.share.handleShare();
			},
			async getPosts() {
				let likes = await db.collection("db-posts-likes").where(`user_id == $cloudEnv_uid`).orderBy("date desc")
					.get();

				let likePostIds = likes.result.data.map(item => {
					return item.post_id;
				});

				let tempPosts = db.collection("db-posts").where({
					_id: dbCmd.in(likePostIds)
				}).getTemp();
				let tempUsers = db.collection("uni-id-users").field("_id, avatar_file, nickname, intro").getTemp();
				let tempTopics = db.collection("db-topics").getTemp();

				let posts = await db.collection(tempPosts, tempUsers, tempTopics).get();

				let resData = posts.result.data;

				resData.forEach(item => {
					item.isLike = true;
				});

				console.log(resData);

				this.posts = resData;
				this.isLoading = false;
			},
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		padding: 25rpx 25rpx calc(env(safe-area-inset-bottom) + 48px + 25rpx) 25rpx;
	}
</style>