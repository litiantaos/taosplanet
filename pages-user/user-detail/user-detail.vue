<template>
	<view>
		<user-detail :userId="userId" :navBarBackground="navBarBackground" :navBarAvatarOpacity="navBarAvatarOpacity"
			:tabBackground="tabBackground" @tabOffsetY="getTabOffsetY" @userInfo="getUserInfo" ref="userDetail"></user-detail>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userId: "",
				navBarBackground: "rgba(255, 255, 255, 0)",
				navBarAvatarOpacity: 0,
				tabBackground: "rgba(255, 255, 255, 0)",
				tabOffsetY: 0,
				userInfo: {}
			};
		},
		onLoad(e) {
			this.userId = e.id;
		},
		methods: {
			getUserInfo(e) {
				// console.log(e);
				this.userInfo = e;
			},
			getTabOffsetY(e) {
				// console.log(e);
				this.tabOffsetY = e;
			},

			// 编辑后返回时调用
			getResumes() {
				this.$refs.userDetail.getResumes();
			},
			getColleges() {
				this.$refs.userDetail.getColleges();
			}
		},
		onPageScroll(e) {
			let scrollTop = e.scrollTop;

			if (scrollTop >= 0) {
				if (scrollTop <= 100) {
					this.navBarBackground = "rgba(255, 255, 255, 0)";
					this.navBarAvatarOpacity = 0;
				} else {
					this.navBarBackground = "rgba(255, 255, 255, 1)";
					this.navBarAvatarOpacity = 1;
				}

				if (scrollTop <= this.tabOffsetY) {
					this.tabBackground = "rgba(255, 255, 255, 0)";
				} else {
					this.tabBackground = "rgba(255, 255, 255, 1)";
				}
			}
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