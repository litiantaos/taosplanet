<template>
	<view v-show="isMount" class="popup">
		<view class="popup-mask" :class="{'active': isShow}" @click="hide"></view>
		<movable-area class="popup-area" :class="{'active': isShow}"
			:style="{height: `${popupHeight * 2}px`, bottom: `${-popupHeight * 2}px`, transform: `translateY(${popupY}px)`}">
			<movable-view class="popup-view" :style="{height: `${popupHeight}px`}" :y="y" direction="vertical" damping="45"
				:disabled="config.disabledTouch" @change="moveChange" @touchend="touchEnd">

				<view class="header">
					<view class="header-title">{{config.title}}</view>
					<view v-if="config.showTitleHide" class="header-hide iconfont icon-arrow-down" @click="hide"></view>
				</view>

				<view class="body">
					<!-- 文本 -->
					<view v-if="config.type == 'text'" class="content">
						<text class="content_text">{{config.text}}</text>
					</view>

					<view v-if="config.showLocation" class="location">
						<location-card @location="getLocation"></location-card>
					</view>

					<!-- 操作 -->
					<scroll-view-pro v-if="config.type == 'action'" :list="config.actions" v-slot="{item, index}"
						horiMargin="50rpx">
						<view class="action" @click="clickAction(index)">
							<i v-if="item.icon" class="iconfont" :class="item.icon" :style="{color: (item.color || '')}"></i>
							<view class="action_text" :style="{color: (item.color || '')}">{{item.text}}</view>
						</view>
					</scroll-view-pro>

					<!-- 输入框 -->
					<view v-if="config.type == 'input'" class="input">
						<input-pro :inputIn="config.inputIn" @input="onInput"></input-pro>
						<view v-if="config.showHandle" class="handle-text" @click="trigger">
							<text>{{config.text}}</text>
						</view>
					</view>

					<!-- 日期时间选择器 -->
					<view v-if="config.type == 'date'" class="date">
						<date-picker :dateIn="config.dateIn" @data="getDate"></date-picker>
					</view>

					<!-- 数据选择器 -->
					<view v-if="config.type == 'picker'" class="picker" :style="{height: config.pickerHeight}">
						<data-picker :pickerIn="config.pickerIn" @data="getPicker"></data-picker>
					</view>

					<!-- 单选 -->
					<view v-if="config.type == 'checkbox'" class="checkbox">
						<checkbox-pro :list="config.checks" @change="getCheck"></checkbox-pro>
					</view>

					<view v-if="config.type == 'custom'" class="container">
						<slot></slot>
					</view>
				</view>

				<view class="footer"
					v-if="!config.hideFooter && (config.type == 'text' || config.type == 'input' || config.type == 'date' || config.type == 'custom')">
					<view class="footer_button" @click="hide">
						<i class="iconfont icon-close"></i>
					</view>
					<view class="footer_button" @click="confirm">
						<i class="iconfont icon-tick"></i>
					</view>
				</view>

			</movable-view>
		</movable-area>
	</view>
</template>

<script>
	export default {
		name: "popup",
		data() {
			return {
				isMount: false,
				isShow: false,
				windowHeight: 0,
				popupHeight: 0,
				popupY: 0,
				safeTop: 0,
				y: 0,
				old: {
					y: 0
				},
				config: {},
				configOptions: ["type", "size", "title", "text", "actions", "inputIn",
					"disabledTouch", "hideFooter", "dateIn", "pickerIn", "pickerHeight", "checks", "showLocation",
					"showHandle", "showTitleHide", "success", "handle"
				]
			};
		},
		mounted() {
			let {
				screenHeight,
				statusBarHeight
			} = getApp().globalData.systemInfo;

			let {
				windowHeight
			} = uni.getSystemInfoSync();

			this.windowHeight = windowHeight;

			if (windowHeight == screenHeight - statusBarHeight - 44) {
				this.safeTop = 20;
			} else {
				this.safeTop = statusBarHeight + 54;
			}
		},
		methods: {
			init() {
				let defaultConfig = {
					type: "text",
					size: "small",
					title: "提示",
					text: "文本内容",
					actions: [],
					disabledTouch: false,
					hideFooter: false,
					showTitleHide: false,
					inputIn: {},
					dateIn: {},
					date: {},
					pickerIn: {},
					checks: [],
					showLocation: false,
					showHandle: false,
					pickerHeight: "calc(100% - 75rpx)",
					success: () => {},
					handle: () => {}
				};

				this.config = defaultConfig;
			},

			trigger() {
				this.config.handle();
			},

			// SUCCESS TO DATA
			confirm() {
				let type = this.config.type;
				let data;

				if (type == "input") {
					data = this.config.inputIn.value;
				} else if (type == "date") {
					data = this.config.date;
				}

				this.config.success(data);
			},

			getLocation(e) {
				this.config.success(e);
			},

			// CHECKBOX
			getCheck(e) {
				let checked = e.id != undefined ? e.id : e._id;

				this.config.checks.forEach((item, index) => {
					if (item.id == checked || item._id == checked) {
						item.checked = true;
					} else {
						item.checked = false;
					}
				});

				this.config.success(e);
			},

			// PICKER
			getPicker(e) {
				this.config.success(e);
			},

			// DATE
			getDate(e) {
				this.config.date = e;
			},

			// INPUT
			onInput(e) {
				this.config.inputIn.value = e;
			},

			clickAction(index) {
				this.config.success(index);
			},

			// POPUP SET PROPS
			set(props) {
				if (this.windowHeight != 0 && this.safeTop != 0) {
					this.isMount = true;
					setTimeout(() => {
						this.isShow = true;

						this.configOptions.forEach(item => {
							this.config[item] = props[item];
						});

						if (this.config.size == "large") {
							this.popupHeight = this.windowHeight - this.safeTop;
						} else if (this.config.size == "medium") {
							this.popupHeight = (this.windowHeight - this.safeTop) * 0.6;
						} else if (this.config.size == "small") {
							this.popupHeight = 240;
						}

						this.popupY = -this.popupHeight;
					}, 50);
				}
			},
			show(props) {
				this.init();

				this.configOptions.forEach(item => {
					props[item] = props[item] || this.config[item];
				});

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
				this.popupY = 0;
				setTimeout(() => {
					this.isMount = false;
				}, 300);
			},
			touchEnd(e) {
				let oy = this.old.y,
					ph = this.popupHeight;

				if (oy < ph * 0.5) {
					this.y = oy;
					this.$nextTick(() => {
						this.y = 0;
					})
				} else {
					this.y = oy;
					this.$nextTick(() => {
						this.y = ph;
						this.hide();
						setTimeout(() => {
							this.y = 0;
						}, 100)
					})
				}
			},
			moveChange(e) {
				let {
					y
				} = e.detail;

				this.old.y = y;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.popup {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 1000;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		pointer-events: none;

		.popup-mask {
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0);
			pointer-events: none;
			transition: background .3s;

			&.active {
				background: rgba(0, 0, 0, 0.6);
				pointer-events: all;
			}
		}

		.popup-area {
			position: fixed;
			left: 0;
			width: 100%;
			opacity: 0;
			pointer-events: none;
			transition: opacity .3s, transform .3s;

			&.active {
				opacity: 1;
			}

			.popup-view {
				position: relative;
				width: 100%;
				box-sizing: border-box;
				background: #fff;
				border-radius: 25rpx 25rpx 0 0;
				pointer-events: all;

				.header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					height: 150rpx;
					padding: 50rpx;

					.header-title {
						font-size: 40rpx;
						font-weight: bold;
						color: #333;
					}

					.header-hide {
						display: flex;
						justify-content: center;
						align-items: center;
						width: 46rpx;
						height: 46rpx;
						background: #eee;
						border-radius: 50%;
						font-size: 24rpx;
						font-weight: bold;
						color: #333;
						line-height: 46rpx;
					}
				}

				.body {
					height: calc(100% - env(safe-area-inset-bottom) - 175rpx);

					.content {
						padding: 0 50rpx;

						&_text {
							font-size: 28rpx;
							color: #333;
							line-height: 50rpx;
							text-align: justify;
						}
					}

					.action {
						display: inline-flex;
						flex-direction: column;
						justify-content: center;
						align-items: center;
						width: 200rpx;
						height: 200rpx;
						background: #eee;
						border-radius: 20rpx;
						color: #333;
						box-sizing: border-box;
						transition: background .2s;

						&:active {
							background: #ddd;
						}

						.iconfont {
							font-size: 40rpx;
							margin-bottom: 20rpx;
						}

						&_text {
							font-size: 24rpx;
						}
					}

					.input,
					.date,
					.picker,
					.location,
					.container {
						width: 100%;
						padding: 0 50rpx;
					}

					.container {
						height: 100%;
					}

					.location {
						margin-bottom: 35rpx;
					}

					.handle-text {
						margin-top: 30rpx;
						font-size: 24rpx;
						color: #666;
						text-align: center;
					}

					.checkbox {
						height: 100%;
					}
				}

				.footer {
					position: absolute;
					bottom: calc(25rpx + env(safe-area-inset-bottom));
					display: flex;
					justify-content: space-between;
					width: 100%;
					padding: 0 50rpx;

					&_button {
						width: 46%;
						height: 100rpx;
						border-radius: 20rpx;
						display: flex;
						justify-content: center;
						align-items: center;
						transition: background .2s;

						&:not(:last-child) {
							color: #999;
							background: #eee;

							&:active {
								background: #ddd;
							}
						}

						&:last-child {
							color: #fff;
							background: #333;

							&:active {
								background: #444;
							}
						}

						.iconfont {
							font-size: 35rpx;
							line-height: 100%;
							font-weight: bold;
						}
					}
				}
			}
		}
	}
</style>