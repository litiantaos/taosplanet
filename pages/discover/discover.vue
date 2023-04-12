<template>
	<view>
		<nav-bar background="rgba(0,0,0,0)" :showBackBtn="false">
			<view class="broadcast">
				<view class="dot">
					<view class="dot-bor"></view>
					<view class="dot-in"></view>
				</view>
				<view class="">234位陶星人正在探索</view>
			</view>
		</nav-bar>

		<map id="map" class="map" :longitude="longitude" :latitude="latitude" :scale="scale" :markers="markers"
			show-location subkey="PT2BZ-U4LY4-JAFU6-XW4C3-XLZA3-GFBU3">
			<cover-view slot="callout">
				<cover-view class="callout" v-for="(item, index) in list" :key="index" :marker-id="markers[index].id">
					<cover-view class="avatar-group">
						<cover-view class="avatar-item" v-for="(v, i) in item.list" :key="i">
							<cloud-file :src="v.avatar_url" width="100%" height="100%" isCover></cloud-file>
						</cover-view>
						<cover-view class="avatar-item more">
							<cover-view class="text">···</cover-view>
						</cover-view>
					</cover-view>
				</cover-view>
			</cover-view>
		</map>

		<view class="reset-position" @click="resetPosition">
			<i class="iconfont icon-navigate-fill" :class="{'active': resetAni}"></i>
		</view>

		<view class="container">
			<scroll-view class="func-wrap" scroll-x>
				<view class="func-item" @click="toEvent">
					<view class="func-item-title">组局吧</view>
					<view class="func-item-text">组局约会面基</view>
				</view>
				<view class="func-item">
					<view class="func-item-title">小圆桌</view>
					<view class="func-item-text">开放空间围炉畅谈</view>
				</view>
				<view class="func-item">
					<view class="func-item-title">更多</view>
					<view class="func-item-text">敬请期待...</view>
				</view>
			</scroll-view>
		</view>
	</view>

	<popup ref="popup"></popup>

	<tab-bar :index="1"></tab-bar>
</template>

<script>
	import {
		getReGeocode
	} from "@/common/request.js";

	import {
		store,
		mutations
	} from "@/uni_modules/uni-id-pages/common/store.js";

	export default {
		data() {
			return {
				longitude: 118.782974,
				latitude: 32.043668,
				scale: 10,
				markers: [],
				list: [],
				districtGroup: [],
				cityGroup: [],
				resetAni: false
			};
		},
		onLoad() {
			this.startLocation();
			this.getUserGroup();
		},
		onReady() {
			this.mapCtx = uni.createMapContext("map", this);
		},
		computed: {
			hasLogin() {
				return store.hasLogin;
			},
			userInfo() {
				return store.userInfo;
			}
		},
		methods: {
			toEvent() {
				uni.navigateTo({
					url: "/pages-fun/event/event"
				});
			},
			async getUserGroup() {
				await this.getCityGroup();

				if (this.userInfo.city) {
					await this.getDistrictGroup();
				}
			},
			async getDistrictGroup() {
				let districtRes = await uniCloud.callFunction({
					name: "users-location-group",
					data: {
						city: this.userInfo.city
					}
				});

				let districtGroup = districtRes.result.data;

				districtGroup.map((item, index) => {
					let distMarker = {
						id: index + 999,
						longitude: item.district_lng,
						latitude: item.district_lat,
						iconPath: "/static/images/empty.png",
						width: 0,
						height: 0,
						customCallout: {
							anchorX: 0,
							anchorY: 0,
							display: "ALWAYS",
						}
					}

					this.markers.push(distMarker);
					this.list.push(item);
				});
			},
			async getCityGroup() {
				let cityRes = await uniCloud.callFunction({
					name: "users-location-group"
				});

				let cityGroup = cityRes.result.data;

				cityGroup.map((item, index) => {
					if (item._id != this.userInfo.city) {
						let cityMarker = {
							id: index,
							longitude: item.city_lng,
							latitude: item.city_lat,
							iconPath: "/static/images/empty.png",
							width: 0,
							height: 0,
							customCallout: {
								anchorX: 0,
								anchorY: 0,
								display: "ALWAYS",
							}
						}

						this.markers.push(cityMarker);
						this.list.push(item);
					}
				});
			},
			startLocation() {
				let sto = uni.getStorageSync("discStart");
				let tempRegion = uni.getStorageSync("tempRegion");
				let userRegion = this.userInfo.region;

				if (!sto) {
					setTimeout(() => {
						this.$refs.popup.show({
							size: "medium",
							type: "text",
							title: "欢迎你，一起探索陶星！",
							text: "我们来自四方，\n却在这里相遇，\n彼此相交是巨大的幸运！\n如果你也愿意分享自己的位置，\n可以同意授权位置信息，\n此处仅会显示你所在的行政区而非精确定位。\n是否继续？",
							success: () => {
								this.getLocation();
								this.$refs.popup.hide();
								this.resetPosition();
							},
						});

						uni.setStorageSync("discStart", true);
					}, 100);
				} else if (this.hasLogin && userRegion.longitude) {
					this.longitude = userRegion.longitude;
					this.latitude = userRegion.latitude;
				} else if (!this.hasLogin && tempRegion) {
					this.longitude = tempRegion.longitude;
					this.latitude = tempRegion.latitude;
				}
			},
			resetPosition() {
				this.mapCtx.moveToLocation();
				this.resetAni = true;
				setTimeout(() => {
					this.resetAni = false;
				}, 1500);
			},
			getLocation() {
				uni.getLocation({
					type: "gcj02",
					success: async res => {
						this.longitude = res.longitude;
						this.latitude = res.latitude;

						let code = res.longitude + "," + res.latitude;

						await getReGeocode(code).then(r => {
							let location = {
								longitude: res.longitude,
								latitude: res.latitude,
								...r
							};

							if (this.hasLogin) {
								mutations.updateUserInfo({
									region: location
								});
							} else {
								uni.setStorageSync("tempRegion", location);
							}
						});
					}
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
	.broadcast {
		font-size: 24rpx;
		color: #666;
		background: #fff;
		height: 32px;
		padding: 0 40rpx 0 20rpx;
		border-radius: 16px;
		display: flex;
		align-items: center;

		.dot {
			position: relative;
			margin-right: 20rpx;

			.dot-bor {
				width: 40rpx;
				height: 40rpx;
				background: #eee;
				border-radius: 50%;
				animation: ripple 3s ease-in infinite;
			}

			.dot-in {
				width: 20rpx;
				height: 20rpx;
				background: #999;
				border-radius: 50%;
				position: absolute;
				top: 10rpx;
				left: 10rpx;
				animation: flicker 3s ease-in infinite;
			}

			@keyframes ripple {
				0% {
					transform: scale(0.5);
				}

				50% {
					transform: scale(1);
				}

				100% {
					transform: scale(0.5);
				}
			}

			@keyframes flicker {
				0% {
					background: #ccc;
				}

				50% {
					background: #999;
				}

				100% {
					background: #ccc;
				}
			}
		}
	}

	.map {
		width: 100vw;
		height: 100vh;
	}

	.callout {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 80rpx;
		background: #fff;
		padding: 0 20rpx;
		border-radius: 40rpx;
		width: fit-content;

		.avatar-group {
			display: flex;
			align-items: center;

			.avatar-item {
				width: 50rpx;
				height: 50rpx;
				border-radius: 50%;
				border: 3px solid #fff;
				background: #eee;
				overflow: hidden;

				&:not(:first-child) {
					margin-left: -20rpx;
				}

				&.more {
					display: flex;
					justify-content: center;
					align-items: center;

					.text {
						font-size: 20rpx;
						font-weight: bold;
						color: #666;
					}
				}
			}
		}
	}

	.reset-position {
		width: 70rpx;
		height: 70rpx;
		background: #fff;
		border-radius: 10rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		position: fixed;
		bottom: calc(env(safe-area-inset-bottom) + 48px + 300rpx);
		right: 25rpx;

		.iconfont {
			font-size: 36rpx;
			color: #666;

			&.active {
				animation: back_scale 1s ease;

				@keyframes back_scale {
					0% {
						opacity: 0;
						transform: scale(0) rotate(0);
					}

					45% {
						opacity: 1;
						transform: scale(1.2) rotate(-60deg);
					}

					90% {
						transform: scale(1) rotate(0);
					}
				}
			}
		}
	}

	.container {
		position: fixed;
		bottom: calc(env(safe-area-inset-bottom) + 48px + 30rpx);
		left: 0;
		width: 100%;

		.func-wrap {
			width: 100%;
			white-space: nowrap;

			.func-item {
				display: inline-flex;
				min-width: 320rpx;
				height: 200rpx;
				background: #fff;
				border-radius: 15rpx;
				flex-direction: column;
				justify-content: center;
				margin-left: 25rpx;
				padding: 0 25rpx;
				transition: background .15s;

				&:last-child {
					margin-right: 25rpx;
				}

				&:active {
					background: #eee;
				}

				.func-item-title {
					font-size: 32rpx;
					font-weight: bold;
				}

				.func-item-text {
					font-size: 24rpx;
					color: #999;
					margin-top: 20rpx;
				}
			}
		}
	}
</style>