<script>
	import uniIdPagesInit from "@/uni_modules/uni-id-pages/init.js";
	import {
		listenMessages
	} from "@/common/cloud.js";

	export default {
		globalData: {
			systemInfo: {}
		},
		onLaunch: async function() {
			uni.getSystemInfo({
				success: res => {
					let menuButton = uni.getMenuButtonBoundingClientRect();

					let systemInfo = {
						screenWidth: res.screenWidth,
						screenHeight: res.screenHeight,
						statusBarHeight: res.statusBarHeight,
						safeAreaInsets: res.safeAreaInsets,
						menuButtonHeight: menuButton.height,
						menuButtonTop: menuButton.top,
						menuButtonBottom: menuButton.bottom
					};

					this.globalData.systemInfo = systemInfo;
				}
			});

			await uniIdPagesInit();

			listenMessages();
		}
	}
</script>

<style>
	@import url("static/fonts/iconfont.css");

	@font-face {
		font-family: "Asap";
		font-style: italic;
		font-weight: 700;
		font-stretch: 100%;
		font-display: swap;
		src: url("static/fonts/asap.woff") format("woff");
		unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
	}

	page {
		background: #f5f5f5;
	}

	view,
	input,
	textarea {
		box-sizing: border-box;
	}
</style>