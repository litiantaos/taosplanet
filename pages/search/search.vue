<template>
	<view>
		<view class="input-area" :style="{transform: `translateY(${inputOffset})`}">
			<input-pro :inputIn="inputIn" @confirm="onConfirm" @focus="onFocus" @blur="onBlur"></input-pro>
		</view>

		<view class="container">
			<tab :tabs="['动态', '用户']" position="sticky" top="0" padding="25rpx" background="#f5f5f5" @change="tabChange">
			</tab>

			<view class="tab-view">
				<view v-if="tabIndex == 0" class="">
					<default-view v-if="showPostsDefault" :showText="true"></default-view>

					<view v-for="(item, index) in posts" :key="index">
						<post :data="item" :postId="item._id"></post>
					</view>
				</view>

				<view v-if="tabIndex == 1" class="">
					<default-view v-if="showUsersDefault" :showText="true"></default-view>

					<view v-for="(item, index) in users" :key="index">
						<user-card :data="item"></user-card>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

	import {
		checkLikes
	} from "@/common/cloud.js";

	const db = uniCloud.database();
	const dbCmd = db.command;

	export default {
		data() {
			return {
				inputOffset: `-50vh`,
				inputIn: {
					placeholder: "搜索你感兴趣的",
					value: "",
					confirmType: "search"
				},
				tabIndex: 0,
				posts: [],
				users: [],
				showPostsDefault: false,
				showUsersDefault: false
			};
		},
		onLoad() {},
		methods: {
			getUsers() {
				let searchField = "nickname";

				db.collection("uni-id-users").where(`${new RegExp(this.inputIn.value, "i")}.test(${searchField})`).field(
					"_id, nickname, avatar_file, intro").get().then(res => {
					// console.log(res);
					this.users = res.result.data;

					this.showUsersDefault = false;

					setTimeout(() => {
						if (!this.users.length) {
							this.showUsersDefault = true;
						}
					}, 100);
				});
			},
			async getPosts() {
				let searchField = "content";

				let tempPosts = db.collection("db-posts").where(`${new RegExp(this.inputIn.value, "i")}.test(${searchField})`)
					.getTemp();
				let tempUsers = db.collection("uni-id-users").field("_id, nickname, avatar_file, intro").getTemp();
				let tempTopics = db.collection("db-topics").getTemp();

				let res = await db.collection(tempPosts, tempUsers, tempTopics).orderBy("last_modify_date desc").get();

				let data = res.result.data;

				if (store.hasLogin) {
					await checkLikes(data).then(result => {
						data = result;
					});
				}

				this.posts = [];

				setTimeout(() => {
					this.posts = data;
				}, 100);

				this.showPostsDefault = false;
				setTimeout(() => {
					if (!this.posts.length) {
						this.showPostsDefault = true;
					}
				}, 100);
			},
			tabChange(e) {
				this.tabIndex = e;
			},
			onConfirm(e) {
				this.inputIn.value = e;

				this.getPosts();
				this.getUsers();
			},
			onBlur() {
				this.inputOffset = 0;
			},
			onFocus(e) {
				let keyboardHeight = e.detail.height;
				this.inputOffset = `calc(${-keyboardHeight}px + 55rpx)`;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.input-area {
		width: 100%;
		background: #f5f5f5;
		padding: 25rpx 25rpx calc(env(safe-area-inset-bottom) + 25rpx) 25rpx;
		position: fixed;
		left: 0;
		bottom: 0;
		transition: transform .3s;
		z-index: 999;
	}

	.container {
		width: 100%;

		.tab-view {
			padding: 25rpx 25rpx calc(env(safe-area-inset-bottom) + 200rpx) 25rpx;
		}
	}
</style>