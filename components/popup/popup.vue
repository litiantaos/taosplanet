<template>
	<view v-show="isMount" class="popup">
		<view class="popup-mask" :class="{'active': isShow}" @click="hide"></view>
		<movable-area class="popup-area" :class="{'active': isShow}"
			:style="{height: `${popupHeight * 2}px`, bottom: `${-popupHeight * 2}px`, transform: `translateY(${popupY}px)`}">
			<movable-view class="popup-view" :style="{height: `${popupHeight}px`}" :y="y" direction="vertical" damping="45"
				:disabled="disabledTouch" @change="moveChange" @touchend="touchEnd">
				<view class="header">
					<view class="header_title">{{title}}</view>
				</view>

				<view class="body">
					<!-- 文本 -->
					<view v-if="type == 'text'" class="content">
						<text class="content_text">{{text}}</text>
					</view>

					<view v-if="showLocation" class="location">
						<location-card @location="getLocation"></location-card>
					</view>

					<!-- 操作 -->
					<scroll-view-pro v-if="type == 'action'" :list="actions" v-slot="{item, index}" horiMargin="50rpx">
						<view class="action" @click="clickAction(index)">
							<i v-if="item.icon" class="iconfont" :class="item.icon" :style="{color: (item.color || '')}"></i>
							<view class="action_text" :style="{color: (item.color || '')}">{{item.text}}</view>
						</view>
					</scroll-view-pro>

					<!-- 输入框 -->
					<view v-if="type == 'input'" class="input">
						<input-pro :inputIn="inputIn" @input="onInput"></input-pro>
						<view v-if="showHandle" class="handle-text" @click="trigger">{{text}}</view>
					</view>

					<!-- 日期时间选择器 -->
					<view v-if="type == 'date'" class="date">
						<date-picker :dateIn="dateIn" @data="getDate"></date-picker>
					</view>

					<!-- 数据选择器 -->
					<view v-if="type == 'picker'" class="picker" :style="{height: pickerHeight}">
						<data-picker :pickerIn="pickerIn" @data="getPicker"></data-picker>
					</view>

					<!-- 单选 -->
					<view v-if="type == 'checkbox'" class="checkbox">
						<checkbox-pro :list="checks" @change="getCheck"></checkbox-pro>
					</view>
				</view>

				<view v-if="!hideFooter && (type == 'text' || type == 'input' || type == 'date')" class="footer">
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
				windowHeight: 0,
				isMount: false,
				isShow: false,
				popupHeight: 0,
				popupY: 0,
				safeTop: 0,
				y: 0,
				old: {
					y: 0
				},
				type: "text",
				size: "small",
				title: "弹窗标题",
				text: "内容文本",
				actions: [],
				success: () => {},
				handle: () => {},
				disabledTouch: false,
				hideFooter: false,
				inputIn: {},
				dateIn: {},
				date: {},
				pickerIn: {},
				checks: [],
				showLocation: false,
				showHandle: false,
				pickerHeight: "calc(100% - 75rpx)"
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
			trigger() {
				this.handle();
			},
			// SUCCESS TO DATA
			confirm() {
				let type = this.type;
				let data;

				if (type == "input") {
					data = this.inputIn.value;
				}

				if (type == "date") {
					data = this.date;
				}

				this.success(data);
			},

			getLocation(e) {
				this.success(e);
			},

			// CHECKBOX
			getCheck(e) {
				let checked = e.id != undefined ? e.id : e._id;

				this.checked = checked;

				this.checks.forEach((item, index) => {
					if (item.id == checked || item._id == checked) {
						item.checked = true;
					} else {
						item.checked = false;
					}
				});

				this.success(e);
			},

			// PICKER
			getPicker(e) {
				this.success(e);
			},

			// DATE
			getDate(e) {
				// console.log(e);
				this.date = e;
			},

			// INPUT
			onInput(e) {
				this.inputIn.value = e;
			},

			clickAction(index) {
				this.success(index);
			},

			// POPUP SET PROPS
			set(props) {
				if (this.windowHeight != 0 && this.safeTop != 0) {
					this.isMount = true;
					setTimeout(() => {
						this.isShow = true;
						this.type = props.type;
						this.size = props.size;
						this.title = props.title;
						this.text = props.text;
						this.actions = props.actions;
						this.success = props.success;
						this.handle = props.handle;
						this.inputIn = props.inputIn;
						this.disabledTouch = props.disabledTouch;
						this.hideFooter = props.hideFooter;
						this.dateIn = props.dateIn;
						this.pickerIn = props.pickerIn;
						this.pickerHeight = props.pickerHeight;
						this.checks = props.checks;
						this.showLocation = props.showLocation;
						this.showHandle = props.showHandle;

						if (this.size == "large") {
							this.popupHeight = this.windowHeight - this.safeTop;
						} else if (this.size == "medium") {
							this.popupHeight = (this.windowHeight - this.safeTop) * 0.6;
						} else if (this.size == "small") {
							this.popupHeight = 240;
						}

						this.popupY = -this.popupHeight;
					}, 50);
				}
			},
			show(props) {
				props = {
					type: props.type ? props.type : this.type,
					size: props.size ? props.size : this.size,
					title: props.title ? props.title : this.title,
					text: props.text ? props.text : this.text,
					actions: props.actions ? props.actions : this.actions,
					success: props.success,
					handle: props.handle,
					inputIn: props.inputIn ? props.inputIn : this.inputIn,
					disabledTouch: props.disabledTouch ? props.disabledTouch : this.disabledTouch,
					hideFooter: props.hideFooter ? props.hideFooter : this.hideFooter,
					dateIn: props.dateIn ? props.dateIn : this.dateIn,
					pickerIn: props.pickerIn ? props.pickerIn : this.pickerIn,
					pickerHeight: props.pickerHeight ? props.pickerHeight : this.pickerHeight,
					checks: props.checks ? props.checks : this.checks,
					showLocation: props.showLocation ? props.showLocation : this.showLocation,
					showHandle: props.showHandle ? props.showHandle : this.showHandle
				};

				if (this.isShow) {
					this.hide();
					setTimeout(() => {
						this.set(props);
					}, 150)
				} else {
					this.set(props);
				}
			},
			hide() {
				this.isShow = false;
				this.popupY = 0;
				this.showLocation = false;
				setTimeout(() => {
					this.isMount = false;
				}, 350);
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

					&_title {
						font-size: 40rpx;
						font-weight: bold;
						color: #333;
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
					.location {
						width: 100%;
						padding: 0 50rpx;
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