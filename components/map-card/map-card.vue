<template>
	<view class="footprint" :style="{borderRadius}" @click="onClick">
		<view class="footprint-back">
			<map id="map" class="map" :longitude="data.longitude" :latitude="data.latitude" :scale="12" :layer-style="2"
				:enable-zoom="false" :enable-scroll="false" :show-location="showLocation" :style="{borderRadius}"
				subkey="PT2BZ-U4LY4-JAFU6-XW4C3-XLZA3-GFBU3">
			</map>
		</view>
		<view v-if="showFront" class="footprint-front">
			<view class="footprint-title">{{title}}</view>
			<view class="footprint-text">{{text}}</view>
		</view>
		<view v-if="showMarker" class="marker"></view>
	</view>
</template>

<script>
	export default {
		name: "map-card",
		props: {
			data: {
				type: Object,
				default: {
					longitude: 118.782974,
					latitude: 32.043668
				}
			},
			showFront: {
				type: Boolean,
				default: false
			},
			showLocation: {
				type: Boolean,
				default: false
			},
			showMarker: {
				type: Boolean,
				default: false
			},
			title: {
				type: String,
				default: ""
			},
			text: {
				type: String,
				default: ""
			},
			borderRadius: {
				type: String,
				default: "20rpx"
			}
		},
		data() {
			return {};
		},
		mounted() {},
		methods: {
			onClick() {
				this.$emit("click");
			}
		}
	}
</script>

<style lang="scss" scoped>
	.footprint {
		position: relative;
		width: 100%;
		height: 80px;
		overflow: hidden;

		.footprint-back {
			display: flex;
			align-items: center;
			width: 100%;
			height: 100%;

			.map {
				width: 100%;
				height: 150%;
				background: #fff;
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
			justify-content: flex-end;
			padding: 25rpx;

			.footprint-title {
				font-size: 28rpx;
				font-weight: bold;
				color: #333;
			}

			.footprint-text {
				font-size: 22rpx;
				color: #666;
				margin-top: 10rpx;
			}
		}

		.marker {
			position: absolute;
			top: 50%;
			left: 50%;
			width: 40rpx;
			height: 40rpx;
			background: dodgerblue;
			border-radius: 50%;
			border: 10rpx solid lightskyblue;
			opacity: .8;
			transform: translate(-50%, -50%);
		}
	}
</style>