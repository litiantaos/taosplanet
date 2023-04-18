<template>
	<view class="input-pro" :class="inputIn.style || 'border'" :style="{borderRadius: inputIn.borderRadius || '20rpx'}">
		<view v-if="inputIn.textarea" class="textarea-wrap">
			<textarea class="textarea" v-model="value" :placeholder="inputIn.placeholder || '请输入内容'"
				:maxlength="inputIn.maxlength || 10" :confirm-type="inputIn.confirmType || 'done'"
				:cursor-spacing="inputIn.cursorSpacing || 70" :adjust-position="inputIn.adjustPosition || false"
				:auto-height="inputIn.autoHeight || false" :show-confirm-bar="false" @input="onInput" @focus="onFocus"
				@blur="onBlur" @confirm="onConfirm">
			</textarea>
			<view v-if="inputIn.showCount" class="input-count">
				{{value.length}}/{{inputIn.maxlength}}
			</view>
		</view>

		<view v-else class="input-wrap">
			<i v-if="inputIn.prefixIcon || false" class="iconfont icon-search prefix-icon"></i>

			<input class="input" v-model="value" :type="inputIn.type || 'text'" :placeholder="inputIn.placeholder || '请输入内容'"
				:maxlength="inputIn.maxlength || 10" :confirm-type="inputIn.confirmType || 'done'"
				:cursor-spacing="inputIn.cursorSpacing || 70" :adjust-position="inputIn.adjustPosition || true" @input="onInput"
				@focus="onFocus" @blur="onBlur" @confirm="onConfirm" />

			<i class="iconfont icon-close-circle-fill suffix-icon" :class="{'active': value != ''}" @click="clearInput"></i>

			<view v-if="inputIn.suffixBtn || false" class="suffix-btn" @click="handle">
				{{inputIn.suffixBtnText}}
			</view>
		</view>
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
			handle() {
				this.$emit("handle");
			},
			onInput(e) {
				this.$emit("input", this.value);
			},
			onFocus(e) {
				this.$emit("focus", e);
			},
			onBlur(e) {
				this.$emit("blur", e);
			},
			onConfirm(e) {
				let {
					value
				} = e.detail;

				this.$emit("confirm", value);
			},
			clearInput() {
				this.value = "";
			}
		}
	}
</script>

<style lang="scss" scoped>
	.input-pro {
		font-size: 28rpx;

		&.border {
			border: 2px solid #333;
		}

		&.gray {
			background: #eee;
		}

		&.white {
			background: #fff;
		}

		.textarea-wrap {
			width: 100%;
			padding: 25rpx;

			.textarea {
				width: 100%;
				height: 500rpx;
				line-height: 50rpx;
				text-align: justify;
			}

			.input-count {
				font-size: 26rpx;
				color: #999;
				text-align: right;
				margin-top: 20rpx;
			}
		}

		.input-wrap {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 0 25rpx;

			.prefix-icon {
				font-size: 36rpx;
				margin-right: 20rpx;
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
	}
</style>