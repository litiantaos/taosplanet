<template>
	<view>
		<nav-bar :showBackBtn="false" :innerOpacity="navBarInnerOpacity">
			<i class="iconfont icon-planet-fill nav-bar_icon"></i>
			<view class="nav-bar_title">TAOSPLANET</view>
		</nav-bar>

		<load-view :isLoading="isLoading"></load-view>

		<pull-down @show="refreshShow" @start="refreshStart" mode="full" ref="refresh">
			<view class="main">
				<swiper v-if="showSwiper" class="swiper">
					<swiper-item v-for="(item, index) in swipers" :key="index">
						<view class="swiper-item"></view>
					</swiper-item>
				</swiper>

				<view v-for="(item, index) in posts" :key="index">
					<post :data="item" :postId="item._id" @like="clickLike" @share="clickShare"></post>
				</view>

				<load-more v-if="!isLoading" :status="loadMore"></load-more>
			</view>
		</pull-down>

		<view class="float-btn" :style="{transform: (floatBtnMove ? 'translateY(300%)' : 'translateY(0)')}"
			@click="toPostPublish" @longpress="toSearch">
			<view class="iconfont icon-add"></view>
		</view>

		<popup ref="popup"></popup>

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
				startScrollTop: 0,
				endScrollTop: 0,
				floatBtnMove: false,
				isLoading: true,
				loadMore: "",
				noMore: false,
				showSwiper: false,
				swipers: [1, 2, 3],
				navBarInnerOpacity: 1
			}
		},
		onLoad() {
			this.getPosts();
		},
		methods: {
			clickTab(e) {
				// console.log(e);
				if (this.scrollTop > 0) {
					uni.pageScrollTo({
						scrollTop: 0
					});
				} else {
					this.$refs.refresh.show();
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
			refreshStart() {
				this.getPosts();
			},
			refreshShow() {
				this.navBarInnerOpacity = 0;
			},
			async getPosts(e = {}) {
				const {
					loadMore = false
				} = e;

				let skip = 0;
				if (loadMore) {
					skip = this.posts.length;
				}

				let tempPosts = db.collection("db-posts").where(`sec_check != 1`).orderBy("sort desc, last_modify_date desc")
					.skip(skip).limit(20).getTemp();
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

				setTimeout(() => {
					this.navBarInnerOpacity = 0;
					this.$refs.refresh.success();
					setTimeout(() => {
						this.navBarInnerOpacity = 1;
					}, 1300);
				}, 300);

				this.loadMore = "";

				setTimeout(() => {
					this.isLoading = false;
				}, 500);
			}
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
		onPageScroll(e) {
			// console.log(e.scrollTop);
			this.scrollTop = e.scrollTop;

			uni.$emit("onPageScroll", e.scrollTop);

			setTimeout(() => {
				this.startScrollTop = e.scrollTop;
				setTimeout(() => {
					this.endScrollTop = e.scrollTop;
				}, 1000);
			}, 10);

			if (this.startScrollTop > this.endScrollTop) {
				this.floatBtnMove = true;
			} else if (this.startScrollTop < this.endScrollTop) {
				this.floatBtnMove = false;
			}
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
		padding: 25rpx 25rpx calc(env(safe-area-inset-bottom) + 48px + 25rpx) 25rpx;

		.swiper {
			height: 120rpx;
			margin-top: 10rpx;

			.swiper-item {
				height: 100%;
				background: #fff;
				border-radius: 20rpx;
				margin: 0 25rpx;
			}
		}
	}

	.float-btn {
		width: 120rpx;
		height: 56rpx;
		background: #eee;
		border-radius: 28rpx;
		opacity: 0.9;
		filter: invert(10%);
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 32rpx;
		font-weight: bold;
		color: #999;
		position: fixed;
		left: calc(50vw - 60rpx);
		bottom: calc(env(safe-area-inset-bottom) + 58px);
		z-index: 998;
		transform: translateY(0);
		transition: transform .5s;
	}
</style>