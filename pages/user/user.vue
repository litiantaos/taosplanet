<template>
	<view>
		<user-detail :userId="userId" :tabUser="true" ref="userDetail"></user-detail>
	</view>

	<tab-bar :index="3"></tab-bar>
</template>

<script>
	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

	export default {
		data() {
			return {
				userId: ""
			};
		},
		onLoad() {
			if (store.hasLogin) {
				this.userId = store.userInfo._id;
			}
		},
		methods: {
			// 编辑后返回时调用
			getResumes() {
				this.$refs.userDetail.getResumes();
			},
			getColleges() {
				this.$refs.userDetail.getColleges();
			},
			getPosts() {
				this.$refs.userDetail.getPosts();
			}
		},
		onReachBottom() {
			uni.$emit("onReachBottom");
		},
		onPageScroll(e) {
			uni.$emit("onPageScroll", e.scrollTop);
		},
		onShareAppMessage() {
			return {
				title: store.userInfo.nickname,
				path: "/pages-user/user-detail/user-detail?id=" + store.userInfo._id
			}
		},
		onShareTimeline() {
			return {
				title: store.userInfo.nickname,
				query: "id=" + store.userInfo._id + "&from=timeline"
			}
		}
	}
</script>

<style lang="scss">

</style>