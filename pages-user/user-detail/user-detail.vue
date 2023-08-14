<template>
	<view>
		<user-detail :userId="userId" @userInfo="getUserInfo" ref="userDetail"></user-detail>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userId: "",
				userInfo: {}
			};
		},
		onLoad(e) {
			this.userId = e.id;
		},
		methods: {
			// 分享页面
			getUserInfo(e) {
				this.userInfo = e;
			},

			// 编辑后返回时调用
			getResumes() {
				this.$refs.userDetail.getResumes();
			},
			getColleges() {
				this.$refs.userDetail.getColleges();
			},
			getProjects() {
				this.$refs.userDetail.getProjects();
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
				title: this.userInfo.nickname,
				path: "/pages-user/user-detail/user-detail?id=" + this.userId
			}
		},
		onShareTimeline() {
			return {
				title: this.userInfo.nickname,
				query: "id=" + this.userId + "&from=timeline"
			}
		}
	}
</script>

<style lang="scss">

</style>