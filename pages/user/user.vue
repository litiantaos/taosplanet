<template>
	<view>
		<user-detail :userId="userId" :navBarBackground="navBarBackground" :navBarAvatarOpacity="navBarAvatarOpacity"
			:tabBackground="tabBackground" @tabOffsetY="getTabOffsetY" :tabUser="true" ref="userDetail"></user-detail>
	</view>

	<popup ref="popup"></popup>

	<tab-bar :index="3"></tab-bar>
</template>

<script>
	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

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
		onLoad() {
			if (store.hasLogin) {
				this.userId = store.userInfo._id;
			}
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