<template>
	<view>
		<nav-bar :showBackBtn="false" :innerOpacity="navBarInnerOpacity">
			<i class="iconfont icon-planet-fill nav-bar_icon"></i>
			<view class="nav-bar_title">TAOSPLANET</view>
		</nav-bar>

		<load-view :isLoading="isLoading"></load-view>

		<float-header custom @onSearch="toSearch" @onEvent="toEvent" @onChat="toChat"></float-header>

		<view style="margin-bottom: 105rpx;">
			<safe-area></safe-area>
		</view>

		<pull-down @show="refreshShow" @start="refreshStart" mode="full" ref="refresh">
			<view class="main">
				<view v-for="(item, index) in posts" :key="index">
					<post :data="item" :postId="item._id" @likeLogin="needLogin" @share="clickShare" @voteLogin="needLogin"
						@voteDate="voteDate"></post>
				</view>

				<load-more v-if="!isLoading" :status="loadMore"></load-more>

				<safe-area type="tabBar"></safe-area>
			</view>
		</pull-down>

		<float-button @click="toPostPublish" @longpress="toSearch"></float-button>

		<popup ref="popup">
			<view class="start">
				<view class="start-text">
					这里是陶学子专属的精神领地，希望能让大家聚在一起共同交流、讨论、发现、创造！
				</view>
				<image class="start-image"
					src="https://7463-tcb-bzyinf8h635kbb2-1cbbca13db4b-1316905658.tcb.qcloud.la/common/share_poster_sim.jpg"
					mode="widthFix">
				</image>
				<view class="start-title">在这里，你可以</view>
				<view class="start-text">
					展示自己的经历与状态<br>分享自己的观点与生活<br>发现志同道合的朋友<br>公开自己的项目并获得支持<br>······
				</view>
			</view>
		</popup>

		<toast ref="toast"></toast>
		<share-handler ref="share"></share-handler>

		<tab-bar :index="0" @change="clickTab"></tab-bar>
	</view>
</template>

<script>
	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

	import {
		checkLikes
	} from "@/common/cloud.js";

	import pagesJson from "@/pages.json";

	const db = uniCloud.database();

	export default {
		data() {
			return {
				posts: [],
				scrollTop: 0,
				isLoading: true,
				loadMore: "",
				noMore: false,
				navBarInnerOpacity: 1
			}
		},
		onLoad() {
			this.getPosts();
			this.showStart();
		},
		methods: {
			showStart() {
				let sto = uni.getStorageSync("start-init");
				if (!sto) {
					setTimeout(() => {
						this.$refs.popup.show({
							size: "large",
							type: "custom",
							title: "欢迎来到陶客星球！",
							hideFooter: true,
							showTitleHide: true
						});

						uni.setStorageSync("start-init", true);
					}, 100);
				}
			},
			voteDate() {
				this.$refs.toast.show({
					type: "info",
					text: "投票已结束",
					duration: "2000"
				});
			},
			clickTab(e) {
				// console.log(e);
				if (e != 0) return;
				if (this.scrollTop > 0) {
					uni.pageScrollTo({
						scrollTop: 0
					});
				} else {
					this.$refs.refresh.show();
					this.posts = [];
					this.noMore = false;
					this.getPosts();
				}
			},
			toSearch() {
				uni.vibrateShort({
					success: () => {
						uni.navigateTo({
							url: "/pages/search/search"
						});
					}
				});
			},
			toEvent() {
				uni.navigateTo({
					url: "/pages-fun/event/event"
				});
			},
			toChat() {
				uni.navigateTo({
					url: "/pages-fun/chat/chat-group/chat-group"
				});
			},
			toPostPublish() {
				uni.vibrateShort({
					success: () => {
						uni.navigateTo({
							url: "/pages-post/post-publish/post-publish"
						});
					}
				});
			},
			clickShare() {
				this.$refs.share.handleShare();
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
			refreshStart() {
				this.getPosts();
			},
			refreshShow() {
				this.navBarInnerOpacity = 0;
			},
			async getPosts() {
				let tempPosts = db.collection("db-posts").where(`sec_check != 1`).orderBy("sort desc, last_modify_date desc")
					.skip(this.posts.length).limit(10).getTemp();
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
					this.navBarInnerOpacity = 0;
					this.$refs.refresh.success();
					setTimeout(() => {
						this.navBarInnerOpacity = 1;
					}, 1300);
				}, 300);
			}
		},
		onReachBottom() {
			this.loadMore = "loading";
			if (this.noMore) {
				this.loadMore = "noMore";
				return;
			};
			this.getPosts();
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
			uni.$emit("onPageScroll", e.scrollTop);
		},
		onShareAppMessage() {
			return {
				title: "生命与理想不可辜负！",
				path: "/pages/index/index",
				imageUrl: "https://7463-tcb-bzyinf8h635kbb2-1cbbca13db4b-1316905658.tcb.qcloud.la/common/share_poster_pure.png"
			}
		},
		onShareTimeline() {
			return {
				title: "生命与理想不可辜负！",
				query: "from=timeline"
			}
		}
	}
</script>

<style lang="scss" scoped>
	.start {
		.start-image {
			width: 100%;
			margin-top: 40rpx;
		}

		.start-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 40rpx;
			margin-top: 10rpx;
		}

		.start-text {
			font-size: 28rpx;
			color: #333;
			line-height: 50rpx;
		}
	}

	.nav-bar {
		&_icon {
			font-size: 48rpx;
			color: $uni-color-primary;
		}

		&_title {
			font-family: "Asap", sans-serif;
			font-size: 40rpx;
			font-weight: 700;
			font-style: italic;
			margin-left: $uni-spacing-base;
		}
	}

	.main {
		width: 100vw;
		padding: 0 25rpx 25rpx;
	}
</style>