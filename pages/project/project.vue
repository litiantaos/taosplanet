<template>
	<view>
		<float-search iconName="add" @onSearch="toSearch" @onButton="toCreate"></float-search>

		<view class="main">
			<view class="" v-for="(item, index) in projects" :key="index">
				<project-card :data="item"></project-card>
			</view>
		</view>

		<safe-area type="tabBar"></safe-area>
	</view>

	<tab-bar :index="1"></tab-bar>
</template>

<script>
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

				let tempProjects = db.collection("db-projects").where(`sec_check != 1`).orderBy("last_modify_date desc")
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
			},
			toSearch() {
				uni.navigateTo({
					url: "/pages/search/search"
				});
			},
			toCreate() {
				uni.navigateTo({
					url: "/pages/project/project-create/project-create"
				});
			},
		},
		onPageScroll(e) {
			uni.$emit("onPageScroll", e.scrollTop);
		}
	}
</script>

<style lang="scss" scoped>
	.main {
		margin-top: 120rpx;
	}
</style>