<template>
	<view class="container">
		<view class="input-wrap" v-for="(item, index) in options" :key="index">
			<input class="input" :value="item.value" :placeholder="'选项 ' + `${index + 1}`" :maxlength="20"
				@input="onInput($event, index)" />
			<view v-if="index != options.length - 1 && options.length > 2" class="iconfont icon-close-circle"
				@click="remove(index)"></view>
			<view v-if="index == options.length - 1 && options.length < 5" class="iconfont icon-add-circle-fill" @click="add">
			</view>
		</view>

		<view class="date-wrap" @click="chooseDate">
			<view class="date-title">投票截止时间</view>
			<view class="date-value">
				<uni-dateformat :date="voteDate" format="yyyy/MM/dd hh:mm"></uni-dateformat>
				<i class="iconfont icon-arrow-right"></i>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "vote-editor",
		props: {
			voteDate: {
				type: [String, Number]
			}
		},
		data() {
			return {
				options: []
			};
		},
		mounted() {
			this.push(2);
		},
		methods: {
			chooseDate() {
				this.$emit("chooseDate");
			},
			onInput(e, i) {
				this.options[i].value = e.detail.value;
				// console.log(this.options);
				this.$emit("input", this.options);
			},
			push(num) {
				for (let i = 1; i <= num; i++) {
					let obj = {
						value: ""
					};

					this.options.push(obj);
				}
			},
			add() {
				this.push(1);
			},
			remove(index) {
				this.options.splice(index, 1);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.input-wrap {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;

		.input {
			flex: 0 0 580rpx;
			height: 80rpx;
			border: 1px solid #ccc;
			box-sizing: border-box;
			border-radius: 15rpx;
			font-size: 28rpx;
			color: #333;
			padding: 0 25rpx;
		}

		.iconfont {
			font-size: 40rpx;
			color: #aaa;
		}
	}

	.date-wrap {
		width: 100%;
		height: 80rpx;
		background: #fff;
		border: 1px solid #ccc;
		box-sizing: border-box;
		border-radius: 15rpx;
		font-size: 28rpx;
		color: #333;
		padding: 0 20rpx 0 25rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		line-height: 100%;

		.date-title {
			color: #333;
		}

		.date-value {
			display: flex;
			align-items: center;
			color: #666;

			.iconfont {
				margin-left: 15rpx;
			}
		}
	}
</style>