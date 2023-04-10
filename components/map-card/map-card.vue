<template>
	<view class="footprint" @click="toFootprint">
		<view class="footprint-back">
			<map id="map" class="map" :longitude="longitude" :latitude="latitude" :scale="12" :layer-style="2"
				:enable-zoom="false" :enable-scroll="false" subkey="PT2BZ-U4LY4-JAFU6-XW4C3-XLZA3-GFBU3">
			</map>
		</view>
		<view class="footprint-front">
			<view class="footprint-title">足迹</view>
			<view class="footprint-text">12个地区</view>
		</view>
	</view>
</template>

<script>
	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

	export default {
		name: "map-card",
		data() {
			return {
				longitude: store.userInfo.region.longitude,
				latitude: store.userInfo.region.latitude
			};
		},
		methods: {
			toFootprint() {
				uni.navigateTo({
					url: "/pages-fun/footprint/footprint"
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
	.footprint {
		position: relative;
		width: 100%;
		height: 80px;
		border-radius: 20rpx;
		overflow: hidden;

		.footprint-back {
			display: flex;
			align-items: center;
			width: 100%;
			height: 100%;
			background: #fff;
			transition: background .15s;

			&:active {
				background: #eee;
			}

			.map {
				width: 100%;
				height: 150%;
			}
		}

		.footprint-front {
			position: absolute;
			bottom: 0;
			left: 0;
			width: 50%;
			height: 100%;
			background-image: linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
			display: flex;
			flex-direction: column;
			justify-content: center;
			padding-left: 25rpx;

			.footprint-title {
				font-size: 28rpx;
				font-weight: bold;
				color: #333;
			}

			.footprint-text {
				font-size: 22rpx;
				color: #999;
				margin-top: 10rpx;
			}
		}
	}
</style>