<template>
	<view class="input-pro" :class="inputIn.textarea ? 'background' : 'border'"
		:style="{borderRadius: inputIn.borderRadius ? inputIn.borderRadius : '20rpx'}">
		<view class="input-inner">
			<i v-if="inputIn.prefixIcon ? inputIn.prefixIcon : false" class="iconfont icon-search prefix-icon"></i>

			<textarea v-if="inputIn.textarea" class="textarea" :value="value"
				:placeholder="inputIn.placeholder ? inputIn.placeholder : '请输入内容'"
				:maxlength="inputIn.maxlength ? inputIn.maxlength : 10"
				:confirm-type="inputIn.confirmType ? inputIn.confirmType : 'done'"
				:cursor-spacing="inputIn.cursorSpacing ? inputIn.cursorSpacing : 70"
				:adjust-position="inputIn.adjustPosition ? inputIn.adjustPosition : false"
				:auto-height="inputIn.autoHeight ? inputIn.autoHeight : false" :show-confirm-bar="false" @input="onInput"
				@focus="onFocus" @blur="onBlur" @confirm="onConfirm" @keyboardheightchange="onKeyboardHeightChange"></textarea>

			<input v-else class="input" type="text" :value="value"
				:placeholder="inputIn.placeholder ? inputIn.placeholder : '请输入内容'"
				:maxlength="inputIn.maxlength ? inputIn.maxlength : 10"
				:confirm-type="inputIn.confirmType ? inputIn.confirmType : 'done'"
				:cursor-spacing="inputIn.cursorSpacing ? inputIn.cursorSpacing : 70"
				:adjust-position="inputIn.adjustPosition ? inputIn.adjustPosition : false" @input="onInput" @focus="onFocus"
				@blur="onBlur" @confirm="onConfirm" @keyboardheightchange="onKeyboardHeightChange" />

			<i v-if="!inputIn.textarea" class="iconfont icon-close-circle-fill suffix-icon" :class="{'active': value != ''}"
				@click="clearInput"></i>

			<view v-if="inputIn.suffixBtn ? inputIn.suffixBtn : false" class="suffix-btn" @click="trigger">
				{{inputIn.suffixBtnText}}
			</view>
		</view>
		<view v-if="inputIn.textarea && inputIn.showCount" class="input-count">{{value.length}}/{{inputIn.maxlength}}</view>
	</view>
</template>

<script>
	export default {
		name: "input-pro",
		props: {
			inputIn: {
				type: Object,
				default: {}
			}
		},
		data() {
			return {
				value: ""
			};
		},
		mounted() {
			if (this.inputIn.value != "") {
				this.value = this.inputIn.value;
			}
		},
		watch: {
			inputIn(newVal) {
				this.value = newVal.value;
			}
		},
		methods: {
			trigger() {
				this.$emit("handle");
			},
			onInput(e) {
				let val = e.detail.value;
				this.value = val;
				this.$emit("input", val);
			},
			onFocus(e) {
				this.$emit("focus", e);
			},
			onBlur(e) {
				this.$emit("blur", e);
			},
			onConfirm(e) {
				let val = e.detail.value;
				this.$emit("confirm", val);
			},
			onKeyboardHeightChange(e) {
				this.$emit("keyboardHeightChange", e);
			},
			clearInput() {
				this.value = "";
			}
		}
	}
</script>

<style lang="scss" scoped>
	.input-pro {
		padding: 0 25rpx;

		&.border {
			border: 2px solid #333;
		}

		&.background {
			background: #fff;
			padding-top: 20rpx;
			padding-bottom: 20rpx;
			text-align: justify;
		}

		.input-inner {
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 28rpx;

			.prefix-icon {
				font-size: 36rpx;
				margin-right: 20rpx;
			}

			.textarea {
				flex: 1;
				min-height: 300rpx;
				max-height: 900rpx;
				line-height: 50rpx;
			}

			.input {
				flex: 1;
				height: 100rpx;
			}

			.suffix-icon {
				font-size: 36rpx;
				margin-left: 20rpx;
				opacity: 0;
				transition: opacity .15s;

				&.active {
					opacity: 0.8;
				}
			}

			.suffix-btn {
				font-size: 28rpx;
				margin-left: 20rpx;
			}
		}

		.input-count {
			font-size: 26rpx;
			color: #999;
			text-align: right;
			margin-top: 20rpx;
		}
	}
</style>