<template>
	<swiper class="swiper" autoplay circular :interval="10000">
		<swiper-item v-for="item in items" :key="item._id">
			<view class="swiper-item" :style="{backgroundImage: `url(${item.poster_url ? item.poster_url : ''})`,
			 backgroundColor: item.background_color ? item.background_color : '#e5e5e5'}" @click="toBroad(item)">
				<image v-if="item.image_url" class="image" :src="item.image_url" mode="heightFix"></image>
				<view v-if="item.title" class="title" :style="{color: item.title_color ? item.title_color : '#666'}">
					{{item.title}}
				</view>
			</view>
		</swiper-item>
	</swiper>
</template>

<script>
	export default {
		name: "broadcast",
		props: {
			items: {
				type: Array,
				default: []
			}
		},
		data() {
			return {};
		},
		methods: {
			toBroad(item) {
				if (item.post_id) {
					uni.navigateTo({
						url: "/pages-post/post-detail/post-detail?id=" + item.post_id
					});
				} else if (item.web_url) {
					uni.navigateTo({
						url: "/pages/webview/webview?url=" + item.web_url
					});
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.swiper {
		height: 56rpx;
		width: 240rpx;
		border-radius: 28rpx;
		overflow: hidden;
		transition: background .2s;

		&:active {
			background: #ccc;
		}

		.swiper-item {
			width: 100%;
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			background-repeat: no-repeat;
			background-size: cover;

			.image {
				height: 50rpx;
				margin-right: 15rpx;
				animation: swing_scale 1.5s;
				animation-delay: 5s;
			}

			.title {
				font-size: 24rpx;
				font-weight: bold;
				white-space: nowrap;
				animation: swing_skew 1.5s;
				transform-origin: 0% 100%;
				animation-delay: 5s;
			}
		}
	}

	@keyframes swing_skew {
		0% {
			opacity: 0;
			transform: translateX(400px) skew(-45deg)
		}

		30% {
			opacity: 1;
			transform: translateX(0) skew(8deg);
		}

		50% {
			transform: translateX(0) skew(-3deg);
		}

		70% {
			transform: translateX(0) skew(1deg);
		}
	}

	@keyframes swing_scale {
		0% {
			opacity: 0;
			transform: scale(0);
		}

		20% {
			opacity: 1;
			transform: scale(1.2);
		}

		35% {
			transform: scale(0.9);
		}

		50% {
			transform: scale(1.08);
		}

		65% {
			transform: scale(0.96);
		}

		80% {
			transform: scale(1.02);
		}

		95%,
		100% {
			transform: scale(1);
		}
	}
</style>