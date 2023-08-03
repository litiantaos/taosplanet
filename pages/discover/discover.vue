<template>
	<view>
		<nav-bar background="rgba(0,0,0,0)" :opacity="nabBarOpacity" :showBackBtn="false">
			<view class="broadcast">
				<view class="dot">
					<view class="dot-bor"></view>
					<view class="dot-in"></view>
				</view>
				<view class="">{{userCount}} 位陶星人正在探索</view>
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
							<cover-view v-if="item.count > 10" class="text">{{item.count < 100 ? item.count : "99+"}}</cover-view>
							<cover-view v-else class="text">···</cover-view>
						</cover-view>
					</cover-view>
				</cover-view>
			</cover-view>
		</map>

		<view class="float-btn">
			<view class="refresh" @click="refresh">
				<i class="iconfont icon-ring" :class="{'active': refreshAni}"></i>
			</view>

			<view class="reset-position" @click="resetPosition">
				<i class="iconfont icon-navigate-fill" :class="{'active': resetAni}"></i>
			</view>
		</view>

		<view class="container">
			<scroll-view class="func-wrap" scroll-x>
				<view class="func-item event" @click="toEvent">
					<view class="func-item-title">组局吧</view>
					<view class="func-item-text">组局约会面基</view>
					<view class="texture"></view>
				</view>
				<view class="func-item chat" @click="toChat">
					<view class="func-item-title">小圆桌</view>
					<view class="func-item-text">开放空间围炉畅谈</view>
					<view class="texture"></view>
				</view>
				<view class="func-item more">
					<view class="func-item-title">更多</view>
					<view class="func-item-text">敬请期待...</view>
					<view class="texture"></view>
				</view>
			</scroll-view>
		</view>
	</view>

	<popup ref="popup"></popup>
	<toast ref="toast"></toast>

	<!-- <tab-bar :index="1"></tab-bar> -->
</template>

<script>
	import {
		getReGeocode
	} from "@/common/request.js";

	import {
		store,
		mutations
	} from "@/uni_modules/uni-id-pages/common/store.js";

	const db = uniCloud.database();

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
				resetAni: false,
				refreshAni: false,
				userCount: 0,
				nabBarOpacity: 1
			};
		},
		onLoad() {
			this.startLocation();
			this.getData();
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
			toChat() {
				uni.navigateTo({
					url: "/pages-fun/chat/chat-group/chat-group"
				});
			},
			async getUserCount() {
				let count = await db.collection("uni-id-users").count();
				this.userCount = count.result.total;
			},
			refresh() {
				this.refreshAni = true;
				setTimeout(() => {
					this.refreshAni = false;
				}, 1500);
				this.getData({
					refresh: true
				});
			},
			toEvent() {
				uni.navigateTo({
					url: "/pages-fun/event/event"
				});
			},
			async getData(e) {
				if (e && e.refresh) {
					this.markers = [];
					this.list = [];
				}

				await this.getCityGroup(e);

				if (this.userInfo.city) {
					await this.getDistrictGroup(e);
				}

				this.getUserCount();
			},
			refreshToast(e) {
				if (e && e.refresh) {
					this.nabBarOpacity = 0;
					setTimeout(() => {
						this.$refs.toast.show({
							type: "success",
							text: "刷新成功",
							duration: "2000"
						});

						setTimeout(() => {
							this.nabBarOpacity = 1;
						}, 2200);
					}, 100);
				}
			},
			async getDistrictGroup(e) {
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
					console.log("dist", this.list);

					this.refreshToast(e);
				});
			},
			async getCityGroup(e) {
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
						console.log("city", this.list);

						this.refreshToast(e);
					}
				});
			},
			startLocation() {
				let sto = uni.getStorageSync("start-disc");
				let tempRegion = uni.getStorageSync("temp-region");
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

						uni.setStorageSync("start-disc", true);
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

	.float-btn {
		position: fixed;
		right: 25rpx;
		bottom: calc(env(safe-area-inset-bottom) + 48px + 300rpx);

		.reset-position,
		.refresh {
			width: 80rpx;
			height: 80rpx;
			background: #fff;
			border-radius: 10rpx;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.reset-position {
			margin-top: 20rpx;

			.iconfont {
				font-size: 40rpx;
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

		.refresh {

			.iconfont {
				font-size: 40rpx;
				color: #999;

				&.active {
					animation: infi_rotate 1s linear infinite;

					@keyframes infi_rotate {
						0% {
							transform: rotate(0);
						}

						100% {
							transform: rotate(360deg);
						}
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
				position: relative;
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
				overflow: hidden;

				&.event {
					.texture {
						position: absolute;
						width: 400rpx;
						height: 400rpx;
						background: #0396ff;
						opacity: .07;
						border-radius: 50%;
						pointer-events: none;
						top: 80rpx;
						right: -100rpx;

						&::before {
							content: "";
							width: 120rpx;
							height: 120rpx;
							background: #0396ff;
							opacity: .5;
							border-radius: 50%;
							pointer-events: none;
							position: absolute;
							top: -60rpx;
							right: 90rpx;
						}
					}
				}

				&.chat {
					.texture {
						position: absolute;
						width: 400rpx;
						height: 400rpx;
						background: #32ccbc;
						opacity: .07;
						border-radius: 50%;
						pointer-events: none;
						top: -100rpx;
						right: -280rpx;

						&::before {
							content: "";
							width: 200rpx;
							height: 200rpx;
							background: #32ccbc;
							opacity: .5;
							border-radius: 50%;
							pointer-events: none;
							position: absolute;
							bottom: 40rpx;
							left: -90rpx;
						}
					}
				}

				&.more {
					.texture {
						position: absolute;
						width: 400rpx;
						height: 400rpx;
						background: #aaa;
						opacity: .1;
						border-radius: 50%;
						pointer-events: none;
						top: 80rpx;
						right: -20rpx;
					}
				}

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
					color: #666;
					margin-top: 20rpx;
				}
			}
		}
	}
</style>