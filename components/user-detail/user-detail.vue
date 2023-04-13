<template>
	<view>
		<nav-bar :background="navBarBackground" :showBackBtn="tabUser ? false : true">
			<cloud-file class="nav-avatar" :src="userInfo" width="32px" height="32px" borderRadius="50%"
				:style="{opacity: navBarAvatarOpacity}"></cloud-file>
		</nav-bar>
		<safe-area></safe-area>

		<view class="container">
			<view class="header-wrap">
				<view class="background-wall" :class="currentUser ? 'curr-user' : 'ncurr-user'">
					<view class="texture"></view>
				</view>

				<view class="user-wrap">
					<view class="avatar-wrap">
						<cloud-file :src="userInfo" width="150rpx" height="150rpx" background="rgba(255, 255, 255, .1)"
							borderRadius="50%" border="10rpx solid rgba(255, 255, 255, .1)" style="zIndex: 1"
							@click="toUserInfo"></cloud-file>
						<view class="visit-wrap">
							<view class="visit-info">访问量 <text style="font-weight: bold;">{{userInfo.view_count}}</text></view>
							<view v-if="currentUser" class="func-btn" @click="toUserInfo">编辑信息</view>
							<!-- <view v-else class="func-btn">加微信</view> -->
						</view>
					</view>

					<view class="name">
						<name-init :data="userInfo"></name-init>
						<view v-if="userInfo.gender && userInfo.gender != 0" class="gender iconfont"
							:class="userInfo.gender == 1 ? 'icon-man male' : 'icon-woman female'"></view>
					</view>

					<view class="intro">
						<text v-if="currentUser">{{hasLogin ? (userInfo.intro ? userInfo.intro : "星球合伙人") : "加入星球合伙人"}}</text>
						<text v-else>{{userInfo.intro ? userInfo.intro : "星球合伙人"}}</text>
					</view>

					<scroll-view class="tags"
						v-if="userInfo.status_id || userInfo.emotion_id || userInfo.region || colleges.length || resumes.length">
						<view v-if="userInfo.status_id && userInfo.status_id != 0" class="tag">{{userInfo.status_name}}</view>
						<view v-if="userInfo.emotion_id && userInfo.emotion_id != 0" class="tag">{{userInfo.emotion_name}}</view>
						<view v-if="userInfo.region" class="tag">{{userInfo.region.city}}</view>
						<view v-if="colleges.length" class="tag">{{colleges[0].college_name}}</view>
						<view v-if="resumes.length" class="tag">{{resumes[0].position}}</view>
					</scroll-view>

					<view class="data-wrap">
						<view class="data-item">
							<view class="data-item-num">{{posts.length || 0}}</view>
							<view class="data-item-text">动态</view>
						</view>
						<view class="data-item">
							<view class="data-item-num">{{count.likeMeCount}}</view>
							<view class="data-item-text">获赞</view>
						</view>
						<view class="data-item" @click="toLikes">
							<view class="data-item-num">{{count.likeCount}}</view>
							<view class="data-item-text">点赞</view>
						</view>
					</view>
				</view>
			</view>

			<view class="footprint">
				<map-card :data="userInfo.region" :showFront="true" title="足迹" text="12个地区"></map-card>
			</view>
		</view>

		<tab :tabs="['动态', '经历']" position="sticky" :top="`${statusBarHeight + 44}px`" padding="25rpx"
			:background="tabBackground" @change="tabChange"></tab>
		<view class="tab-view">
			<view v-if="tabIndex == 0">
				<view v-for="(item, index) in posts" :key="index">
					<post :data="item" :postId="item._id" @share="clickShare"></post>
				</view>

				<load-more :status="loadMore"></load-more>
			</view>

			<view v-if="tabIndex == 1">
				<view class="resume-wrap">
					<view class="resume-title-wrap">
						<view class="resume-title">工作经历</view>
						<view v-if="currentUser" class="edit-btn iconfont icon-add-circle" @click="toUserResume('')"></view>
					</view>
					<view v-if="resumes.length" class="resume-list">
						<view class="resume" v-for="(item, index) in resumes" :key="index">
							<view class="time-line-wrap">
								<view class="time-dot"></view>
								<view class="time-line"></view>
							</view>
							<view class="resume-content-wrap">
								<view class="resume-content-title-wrap">
									<view class="resume-content-title">
										<uni-dateformat :date="item.start_date" format="yyyy.MM"></uni-dateformat> -
										<uni-dateformat :date="item.end_date" format="yyyy.MM"></uni-dateformat>
									</view>
									<view v-if="currentUser" class="edit-btn iconfont icon-edit" @click="toUserResume(item)">
									</view>
								</view>
								<view class="resume-content-subtitle">{{item.company}}<text> · {{item.industry_name}}</text></view>
								<view class="resume-content-text">{{item.position}}</view>
							</view>
						</view>
					</view>
					<view v-else class="resume-default">暂无</view>
				</view>

				<view class="resume-wrap">
					<view class="resume-title-wrap">
						<view class="resume-title">教育经历</view>
						<view v-if="currentUser" class="edit-btn iconfont icon-add-circle" @click="toUserCollege('')"></view>
					</view>
					<view v-if="colleges.length" class="resume-list">
						<view class="resume" v-for="(item, index) in colleges" :key="index">
							<view class="time-line-wrap">
								<view class="time-dot"></view>
								<view class="time-line"></view>
							</view>
							<view class="resume-content-wrap">
								<view class="resume-content-title-wrap">
									<view class="resume-content-title">{{item.start_date}} - {{item.end_date}}</view>
									<view v-if="currentUser" class="edit-btn iconfont icon-edit" @click="toUserCollege(item)">
									</view>
								</view>
								<view class="resume-content-subtitle">{{item.college_name}}</view>
								<view class="resume-content-text">{{item.major}}</view>
							</view>
						</view>
					</view>
					<view v-else class="resume-default">暂无</view>
				</view>
			</view>
		</view>

		<safe-area :type="tabUser ? 'tabBar' : 'bottom'"></safe-area>
	</view>

	<share-handler ref="share"></share-handler>
</template>

<script>
	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

	import {
		checkLikes
	} from "@/common/cloud.js";

	const utils = uniCloud.importObject("utils", {
		customUI: true
	});

	const db = uniCloud.database();
	const dbCmd = db.command;

	export default {
		name: "user-detail",
		props: {
			userId: {
				type: String,
				default: ""
			},
			tabUser: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				statusBarHeight: 0,
				navBarBackground: "rgba(0, 0, 0, 0)",
				navBarAvatarOpacity: 0,
				tabBackground: "rgba(0, 0, 0, 0)",
				tabIndex: 0,
				userInfo: {},
				currentUser: false,
				posts: [],
				count: {
					likeCount: 0,
					likeMeCount: 0
				},
				colleges: [],
				resumes: [],
				loadMore: "",
				noMore: false
			};
		},
		mounted() {
			let {
				statusBarHeight
			} = getApp().globalData.systemInfo;

			this.statusBarHeight = statusBarHeight;

			this.setScrollEffect();

			if (this.userId) {
				let uid = uniCloud.getCurrentUserInfo().uid;

				if (this.userId == uid) {
					this.currentUser = true;
				}

				this.getUserInfo();
				this.getPosts();
				this.getCount();
				this.getColleges();
				this.getResumes();
				this.updateViewCount();
			} else {
				return;
			}

			this.onReachBottom();
		},
		destroyed() {
			uni.$off();
		},
		computed: {
			hasLogin() {
				return store.hasLogin;
			}
		},
		methods: {
			onReachBottom() {
				uni.$on("onReachBottom", () => {
					if (this.tabIndex == 0) {
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
					}
				});
			},
			setScrollEffect() {
				let tabOffsetY = 0;

				setTimeout(() => {
					const query = uni.createSelectorQuery().in(this);
					query.selectAll(".container").boundingClientRect(data => {
						// console.log(data);
						tabOffsetY = data[0].height;
					}).exec();
				}, 500);

				uni.$on("onPageScroll", e => {
					let scrollTop = e;

					if (scrollTop >= 0) {
						if (scrollTop <= 100) {
							this.navBarBackground = "rgba(255, 255, 255, 0)";
							this.navBarAvatarOpacity = 0;
						} else {
							this.navBarBackground = "rgba(255, 255, 255, 1)";
							this.navBarAvatarOpacity = 1;
						}

						if (scrollTop <= tabOffsetY) {
							this.tabBackground = "rgba(255, 255, 255, 0)";
						} else {
							this.tabBackground = "rgba(255, 255, 255, 1)";
						}
					}
				});
			},
			clickShare() {
				this.$refs.share.handleShare();
			},
			updateViewCount() {
				utils.calc("uni-id-users", "view_count", this.userId, 1).then(res => {
					// console.log(res);
				});
			},
			getResumes() {
				db.collection("db-users-resumes").where(`user_id == "${this.userId}"`).orderBy("start_date desc")
					.get().then(res => {
						console.log(res);
						this.resumes = res.result.data;
					});
			},
			getColleges() {
				db.collection("db-users-colleges").where(`user_id == "${this.userId}"`).orderBy("start_date desc").get()
					.then(res => {
						// console.log(res);
						this.colleges = res.result.data;
					});
			},
			async getCount() {
				let likeCount = await db.collection("db-posts-likes").where(`user_id == "${this.userId}"`).count();
				this.count.likeCount = likeCount.result.total;

				let likeMeCount = await db.collection("db-posts").where(`user_id == "${this.userId}"`)
					.groupBy("user_id").groupField("sum(like_count) as total").get();
				this.count.likeMeCount = likeMeCount.result.data[0].total;
			},
			getPosts(e = {}) {
				const {
					loadMore = false
				} = e;

				let skip = 0;
				if (loadMore) {
					skip = this.posts.length;
				}

				let tempPosts = db.collection("db-posts").where(`user_id == "${this.userId}" && sec_check != 1`).orderBy(
					"last_modify_date desc").skip(skip).limit(10).getTemp();
				let tempUsers = db.collection("uni-id-users").field("_id, avatar_file, nickname, intro").getTemp();
				let tempTopics = db.collection("db-topics").getTemp();

				db.collection(tempPosts, tempUsers, tempTopics).get().then(async res => {
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

					await checkLikes(resData).then(result => {
						resData = result;
					});

					this.posts = resData;

					this.loadMore = "";
				})
			},
			getUserInfo() {
				db.collection("uni-id-users").where(`_id == "${this.userId}"`)
					.field(
						"_id, avatar_file, nickname, intro, gender, birth_date, hometown, region, emotion_id, emotion_name, status_id, status_name, view_count"
					).get().then(res => {
						this.userInfo = res.result.data[0];
						this.$emit("userInfo", this.userInfo);
					});
			},
			toUserResume(e) {
				uni.setStorageSync("user-resume", e);

				uni.navigateTo({
					url: "/pages-user/user-resume/user-resume"
				});
			},
			toUserCollege(e) {
				uni.setStorageSync("user-college", e);

				uni.navigateTo({
					url: "/pages-user/user-college/user-college"
				});
			},
			tabChange(e) {
				// console.log(e);
				this.tabIndex = e;
			},
			toUserInfo() {
				if (this.currentUser) {
					uni.navigateTo({
						url: "/pages-user/user-info/user-info"
					});
				}
			},
			toLikes() {
				if (this.currentUser) {
					uni.navigateTo({
						url: "/pages-user/user-likes/user-likes"
					});
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.nav-avatar {
		transition: opacity .3s;
	}

	.container {
		width: 100%;
		padding: 25rpx;

		.header-wrap {
			width: 100%;
			background: #fff;
			border-radius: 20rpx;
			overflow: hidden;
			position: relative;
			margin-bottom: 25rpx;

			.background-wall {
				width: 100%;
				height: 200rpx;
				position: absolute;
				z-index: 0;

				&.curr-user {
					background-image: linear-gradient(to bottom, #a3bded 0%, #6991c7 100%);
				}

				&.ncurr-user {
					background-image: linear-gradient(to top, #e6b980 0%, #eacda3 100%);
				}

				.texture {
					width: 500rpx;
					height: 500rpx;
					background: rgba(255, 255, 255, 0.1);
					border-radius: 50%;
					pointer-events: none;
					position: relative;
					transform: translate(-155rpx, -50rpx);

					&::before {
						content: "";
						width: 900rpx;
						height: 900rpx;
						background: rgba(255, 255, 255, 0.1);
						border-radius: 50%;
						pointer-events: none;
						position: absolute;
						top: -80rpx;
						left: -150rpx;
					}
				}
			}

			.user-wrap {
				padding: 0 25rpx 25rpx;
				margin-top: 120rpx;

				.avatar-wrap {
					display: flex;
					justify-content: space-between;
					align-items: flex-start;

					.visit-wrap {
						text-align: end;
						z-index: 1;

						.visit-info {
							font-size: 24rpx;
							color: #fff;
							margin-top: 35rpx;
						}

						.func-btn {
							padding: 10rpx 20rpx;
							background: #eee;
							border-radius: 10rpx;
							font-size: 22rpx;
							color: #333;
							margin-top: 35rpx;
						}
					}
				}

				.name {
					font-size: 40rpx;
					font-weight: bold;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					margin-top: 40rpx;
					display: flex;
					align-items: center;

					.gender {
						display: flex;
						justify-content: center;
						align-items: center;
						width: 40rpx;
						height: 40rpx;
						background: #eee;
						border-radius: 10rpx;
						font-size: 20rpx;
						margin-left: 20rpx;

						&.male {
							color: royalblue;
						}

						&.female {
							color: pink;
						}
					}
				}

				.intro {
					font-size: 26rpx;
					color: #333;
					margin-top: 25rpx;
					line-height: 40rpx;
				}

				.tags {
					width: 100%;
					white-space: nowrap;
					margin-top: 25rpx;

					.tag {
						display: inline-block;
						padding: 5rpx 15rpx;
						background: #eee;
						border-radius: 10rpx;
						font-size: 22rpx;
						color: #333;
						white-space: nowrap;
						margin-right: 15rpx;
					}
				}

				.data-wrap {
					display: flex;
					margin-top: 40rpx;

					.data-item {
						text-align: center;
						margin-right: 60rpx;

						.data-item-num {
							font-size: 30rpx;
							font-weight: bold;
						}

						.data-item-text {
							font-size: 24rpx;
							color: #666;
						}
					}
				}
			}
		}
	}

	.tab-view {
		padding: 25rpx;

		.resume-wrap {
			background: #fff;
			border-radius: 20rpx;
			padding: 25rpx;
			margin-bottom: 25rpx;

			.resume-title-wrap {
				height: 60rpx;
				display: flex;
				justify-content: space-between;
				align-items: center;

				.resume-title {
					font-size: 30rpx;
					font-weight: bold;
				}

				.edit-btn {
					padding: 10rpx 8rpx 10rpx 40rpx;
					font-size: 34rpx;
					color: #666;
				}
			}

			.resume-list {
				margin-top: 25rpx;

				.resume {
					display: flex;
					align-items: center;
					position: relative;

					.time-line-wrap {
						position: absolute;
						width: 40rpx;
						height: 100%;
						display: flex;
						justify-content: center;

						.time-dot {
							width: 20rpx;
							height: 20rpx;
							background: #999;
							border: 10rpx solid #eee;
							box-sizing: unset;
							border-radius: 50%;
							position: absolute;
							top: 25rpx;
						}

						.time-line {
							width: 3rpx;
							height: 100%;
							background: #eee;
						}
					}

					.resume-content-wrap {
						width: 100%;
						padding: 20rpx 0 20rpx 70rpx;

						.resume-content-title-wrap {
							display: flex;
							justify-content: space-between;
							align-items: center;

							.resume-content-title {
								font-size: 30rpx;
								font-weight: bold;
							}

							.edit-btn {
								padding: 10rpx 10rpx 10rpx 40rpx;
								font-size: 30rpx;
								color: #aaa;
							}
						}

						.resume-content-subtitle {
							font-size: 26rpx;
							color: #333;
							margin-top: 15rpx;
						}

						.resume-content-text {
							font-size: 26rpx;
							color: #666;
							margin-top: 10rpx;
						}
					}
				}
			}

			.resume-default {
				height: 50rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 26rpx;
				color: #999;
			}
		}
	}
</style>