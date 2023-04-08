<template>
	<view v-show="isMount" class="toast"
		:style="{background, transform: (isShow ? `translate(-50%, ${offset}px)` : `translate(-50%, 0)`)}" @click="onClick">
		<view class="iconfont icon" :class="[icon[type].name, {'loading': type == 'loading'}]"
			:style="{color: icon[type].color}"></view>
		<view class="text">{{text ? text : icon[type].value}}</view>
		<view v-if="marker" class="iconfont icon-arrow-right marker"></view>
	</view>
</template>

<script>
	export default {
		name: "toast",
		data() {
			return {
				isMount: false,
				isShow: false,
				offset: 0,
				type: "info",
				text: "",
				background: "#fff",
				duration: "2000",
				marker: false,
				success: () => {},
				icon: {
					"info": {
						name: "icon-info-circle-fill",
						color: "#666",
						value: "提示"
					},
					"success": {
						name: "icon-tick-circle-fill",
						color: "#61c555",
						value: "操作成功"
					},
					"error": {
						name: "icon-close-circle-fill",
						color: "#666",
						value: "操作失败"
					},
					"loading": {
						name: "icon-ring",
						color: "#666",
						value: "加载中"
					},
				}
			};
		},
		mounted() {
			let {
				screenHeight,
				statusBarHeight,
				menuButtonTop
			} = getApp().globalData.systemInfo;

			let {
				windowHeight
			} = uni.getSystemInfoSync();

			if (windowHeight == screenHeight - statusBarHeight - 44) {
				this.offset = 84;
			} else {
				this.offset = 64 + menuButtonTop;
			}
		},
		methods: {
			timer() {},
			set(props) {
				this.isMount = true;
				setTimeout(() => {
					this.isShow = true;
					this.type = props.type;
					this.text = props.text;
					this.background = props.background;
					this.duration = props.duration;
					this.marker = props.marker;
					this.success = props.success;

					if (props.duration != "none") {
						this.timer = setTimeout(() => {
							this.hide();
						}, props.duration);
					}
				}, 50);
			},
			show(props) {
				this.timer && clearTimeout(this.timer);

				props = {
					type: props.type ? props.type : this.type,
					text: props.text ? props.text : this.text,
					background: props.background ? props.background : this.background,
					duration: props.duration ? props.duration : this.duration,
					marker: props.marker ? props.marker : this.marker,
					success: props.success ? props.success : this.success,
				};

				if (this.isShow) {
					this.hide();
					setTimeout(() => {
						this.set(props);
					}, 300);
				} else {
					this.set(props);
				}
			},
			hide() {
				this.isShow = false;
				this.timer && clearTimeout(this.timer);
				setTimeout(() => {
					this.isMount = false;
				}, 300);
			},
			onClick() {
				this.success();
			}
		}
	}
</script>

<style lang="scss" scoped>
	.toast {
		position: fixed;
		top: -64px;
		left: 50vw;
		z-index: 9999;
		display: flex;
		justify-content: center;
		align-items: center;
		min-width: 200rpx;
		height: 32px;
		padding: 0 30rpx;
		border: 1rpx solid #eee;
		border-radius: 16px;
		line-height: 100%;
		transform: translate(-50%, 0);
		transition: transform .3s;

		.icon {
			margin-right: 20rpx;

			&.loading {
				animation: loading 1s linear infinite;

				@keyframes loading {
					0% {
						transform: rotate(0deg);
					}

					100% {
						transform: rotate(360deg);
					}
				}
			}
		}

		.text {
			font-size: 24rpx;
			color: #666;
			white-space: nowrap;
		}

		.marker {
			color: #666;
			margin-left: 10rpx;
		}
	}
</style>