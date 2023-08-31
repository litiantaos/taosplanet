<template>
	<view class="header" :style="{top: `${height}px`, transform: (offsetY ? 'translateY(-100%)' : 'translateY(0)')}">
		<view class="wrapper">
			<view class="search-box" @click="onSearch">
				<view class="iconfont icon-search"></view>
				<view class="search-text">搜索</view>
			</view>

			<view v-if="banners.length" class="broadcast">
				<broadcast :items="banners"></broadcast>
			</view>
		</view>
		<view class="group">
			<view class="iconfont icon-speedometer search-btn" @click="onEvent"></view>
			<view class="iconfont icon-sticker search-btn" @click="onChat"></view>
		</view>
	</view>
</template>

<script>
	const db = uniCloud.database();

	export default {
		name: "float-header",
		props: {
			custom: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				height: 0,
				offsetY: false,
				startScrollTop: 0,
				endScrollTop: 0,
				banners: [],
			};
		},
		mounted() {
			let {
				safeAreaInsets
			} = getApp().globalData.systemInfo;

			if (this.custom) {
				this.height = safeAreaInsets.top + 44;
			} else {
				this.height = 0;
			}

			this.getBanners();

			uni.$on("onPageScroll", e => {
				this.setOffset(e);
			});
		},
		methods: {
			getBanners() {
				db.collection("db-banners").where(`status == true`).orderBy('sort desc').get().then(res => {
					this.banners = res.result.data;
				});
			},
			onSearch() {
				this.$emit("onSearch");
			},
			onEvent() {
				this.$emit("onEvent");
			},
			onChat() {
				this.$emit("onChat");
			},
			setOffset(e) {
				setTimeout(() => {
					this.startScrollTop = e;
					setTimeout(() => {
						this.endScrollTop = e;
					}, 1000);
				}, 10);

				if (this.startScrollTop > this.endScrollTop) {
					this.offsetY = true;
				} else if (this.startScrollTop < this.endScrollTop) {
					this.offsetY = false;
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.header {
		padding: 25rpx;
		display: flex;
		justify-content: space-between;
		position: fixed;
		left: 0;
		width: 100%;
		background: #f5f5f5;
		z-index: 99;
		transition: transform .5s;

		.wrapper {
			display: flex;
			align-items: center;

			.broadcast {
				margin-left: 20rpx;
			}
		}

		.search-box {
			width: fit-content;
			line-height: 56rpx;
			background: #e5e5e5;
			border-radius: 28rpx;
			display: flex;
			color: #666;
			transition: background .2s;

			&:active {
				background: #ccc;
			}

			.search-text {
				margin-left: 20rpx;
				margin-right: 30rpx;
				font-size: 24rpx;
			}

			.iconfont {
				font-size: 28rpx;
				margin-left: 25rpx;
			}
		}

		.group {
			display: flex;
			align-items: center;
		}

		.search-btn {
			font-size: 44rpx;
			color: #333;
			margin-left: 35rpx;
		}
	}
</style>