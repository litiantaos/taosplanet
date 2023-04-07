<template>
	<view>
		<user-detail :userId="userId" :navBarBackground="navBarBackground" :navBarAvatarOpacity="navBarAvatarOpacity"
			:tabBackground="tabBackground" @tabOffsetY="getTabOffsetY" ref="userDetail"></user-detail>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userId: "",
				navBarBackground: "rgba(255, 255, 255, 0)",
				navBarAvatarOpacity: 0,
				tabBackground: "",
				tabOffsetY: 0,
			};
		},
		onLoad(e) {
			this.userId = e.id;
		},
		methods: {
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
		}
	}
</script>

<style lang="scss">

</style>