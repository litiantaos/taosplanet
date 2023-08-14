<template>
	<view>
		<view class="header-bar">
			<view class="iconfont icon-search header-btn"></view>
			<view class="group">
				<view class="iconfont icon-wallet header-btn" @click="toWallet"></view>
				<view class="iconfont icon-add-circle header-btn" @click="toCreate"></view>
			</view>
		</view>

		<view class="main">
			<view class="" v-for="(item, index) in projects" :key="index">
				<project-card :data="item"></project-card>
			</view>
		</view>

		<safe-area type="tabBar"></safe-area>
	</view>

	<popup ref="popup"></popup>

	<tab-bar :index="1"></tab-bar>
</template>

<script>
	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

	import pagesJson from "@/pages.json";

	const db = uniCloud.database();

	export default {
		data() {
			return {
				projects: [],
				noMore: false
			};
		},
		onLoad() {
			this.getProjects();
		},
		methods: {
			async getProjects(e = {}) {
				const {
					loadMore = false
				} = e;

				let skip = 0;
				if (loadMore) {
					skip = this.projects.length;
				}

				let tempProjects = db.collection("db-projects").where(`sec_check != 1`)
					.field("_id, user_id, title, excerpt").orderBy("last_modify_date desc")
					.skip(skip).limit(20).getTemp();
				let tempUsers = db.collection("uni-id-users").field("_id, avatar_file, nickname").getTemp();

				let res = await db.collection(tempProjects, tempUsers).get();

				let resData = [];

				if (loadMore) {
					if (res.result.data.length == 0) {
						this.noMore = true;
					}
					resData = [...this.projects, ...res.result.data];
				} else {
					this.projects = [];
					resData = res.result.data;
					this.noMore = false;
				}

				this.projects = resData;
				console.log(this.projects);

				setTimeout(() => {
					uni.stopPullDownRefresh();
				}, 500);
			},
			toSearch() {
				uni.navigateTo({
					url: "/pages/search/search"
				});
			},
			toCreate() {
				if (store.hasLogin) {
					uni.navigateTo({
						url: "/pages-project/project-create/project-create"
					});
				} else {
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
				}
			},
		},
		onPullDownRefresh() {
			this.getProjects();
		},
		onPageScroll(e) {
			uni.$emit("onPageScroll", e.scrollTop);
		}
	}
</script>

<style lang="scss" scoped>
	.main {
		margin: 90rpx 25rpx 0 25rpx;
	}

	.header-bar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 80rpx;
		background: #f5f5f5;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 25rpx;

		.group {
			display: flex;
			justify-content: flex-end;
			align-items: center;

			.iconfont {
				margin-left: 35rpx;
			}
		}

		.iconfont {
			font-size: 42rpx;
		}
	}
</style>