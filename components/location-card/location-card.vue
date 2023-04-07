<template>
	<view class="location">
		<view class="location-text">
			<i class="iconfont icon-location-fill"></i>
			<view class="">{{location.province}} {{location.city}} {{location.district}}</view>
		</view>
		<view class="confirm iconfont icon-tick" @click="confirm"></view>
	</view>
</template>

<script>
	import {
		getReGeocode
	} from "@/common/request.js";

	export default {
		name: "location-card",
		data() {
			return {
				location: {}
			};
		},
		mounted() {
			this.getLocation();
		},
		methods: {
			confirm() {
				this.$emit("location", this.location);
			},
			getLocation() {
				uni.getLocation({
					type: "gcj02",
					success: res => {
						let code = res.longitude + "," + res.latitude;

						getReGeocode(code).then(r => {
							let location = {
								longitude: res.longitude,
								latitude: res.latitude,
								...r
							};

							this.location = location;
							// console.log(location);
						});
					}
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
	.location {
		width: 100%;
		height: 80rpx;
		background: #eee;
		border-radius: 15rpx;
		font-size: 28rpx;
		color: #333;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.location-text {
			display: flex;
			align-items: center;

			.iconfont {
				font-size: 34rpx;
				color: #666;
				margin: 0 20rpx;
			}
		}

		.confirm {
			width: 100rpx;
			height: 100%;
			color: #666;
			font-weight: bold;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}
</style>