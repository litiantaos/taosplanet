<template>
	<view>
		<view class="header-bar">
			<!-- <view class="iconfont icon-search header-btn"></view> -->
			<view class="group">
				<view class="iconfont icon-wallet header-btn" @click="toWallet"></view>
				<view class="iconfont icon-add-circle header-btn" @click="toCreate"></view>
			</view>
		</view>

		<view class="main">
			<view v-for="(item, index) in projects" :key="index">
				<project-card :data="item"></project-card>
			</view>
			<load-more v-if="projects.length >= 10" :status="loadMore"></load-more>
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
				loadMore: "",
				noMore: false
			};
		},
		onLoad() {
			this.getProjects();
		},
		methods: {
			toWallet() {
				uni.navigateTo({
					url: "/pages-project/wallet/wallet"
				});
			},
			async getProjects() {
				let tempProjects = db.collection("db-projects").where(`sec_check != 1`)
					.field("_id, user_id, title, excerpt").orderBy("last_modify_date desc")
					.skip(this.projects.length).limit(10).getTemp();
				let tempUsers = db.collection("uni-id-users").field("_id, avatar_file, nickname").getTemp();

				let res = await db.collection(tempProjects, tempUsers).get();

				let newData = res.result.data;

				if (newData.length == 0) {
					this.noMore = true;
					this.loadMore = "noMore";
					return;
				}

				let resData = [...this.projects, ...newData];

				this.projects = resData;
				// console.log(this.projects);

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
		onReachBottom() {
			this.loadMore = "loading";
			if (this.noMore) {
				this.loadMore = "noMore";
				return;
			};
			this.getProjects();
		},
		onPageScroll(e) {
			uni.$emit("onPageScroll", e.scrollTop);
		},
		onShareAppMessage() {
			return {
				title: "看看大家都在做什么项目吧，生命与理想不可辜负！",
				path: "/pages/project/project"
			}
		},
		onShareTimeline() {
			return {
				title: "看看大家都在做什么项目吧，生命与理想不可辜负！",
				query: "from=timeline"
			}
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
		// justify-content: space-between;
		justify-content: flex-end;
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
			font-size: 44rpx;
		}
	}
</style>