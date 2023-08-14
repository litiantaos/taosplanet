<template>
	<view class="tab" :style="{position, top, padding, background}">
		<view class="tab-item">
			<view class="tab-item-title" :class="{'active': index == selectedIndex}" v-for="(item, index) in tabs"
				:key="index" @click="clickTabItem(index)">{{item}}</view>
		</view>

		<view class="tab-slider"
			:style="['--offset-x: ' + itemOffsetXList[selectedIndex] + 'px;', 'width: ' + itemWidthList[selectedIndex] + 'px;']">
		</view>
	</view>
</template>

<script>
	export default {
		name: "tab",
		props: {
			tabs: {
				type: Array,
				default: []
			},
			position: {
				type: String,
				default: "relative"
			},
			top: {
				type: String,
				default: "0"
			},
			padding: {
				type: String,
				default: "25rpx 0"
			},
			index: {
				type: Number,
				default: 0
			},
			background: {
				type: String,
				default: "#fff"
			}
		},
		data() {
			return {
				selectedIndex: 0,
				itemOffsetXList: [],
				itemWidthList: []
			};
		},
		watch: {
			index(newVal) {
				this.selectedIndex = newVal;
			}
		},
		mounted() {
			this.getItemOffsetXList();
		},
		methods: {
			clickTabItem(index) {
				this.selectedIndex = index;
				this.$emit("change", index);
			},
			getItemOffsetXList() {
				const query = uni.createSelectorQuery().in(this);
				query.select(".tab").boundingClientRect(data => {
					let tabLeft = data.left;

					query.selectAll(".tab-item-title").boundingClientRect(data => {
						this.itemOffsetXList = data.map(item => (item.left + item.right) / 2 - tabLeft);
						this.itemWidthList = data.map(item => (item.right - item.left));
						this.selectedIndex += 1;
						this.selectedIndex -= 1;
					}).exec();
				}).exec();
			}
		}
	}
</script>

<style lang="scss" scoped>
	.tab {
		z-index: 999;
		width: 100%;
		transition: background .3s;

		&-item {
			display: flex;

			&-title {
				color: #999;
				font-size: 30rpx;
				line-height: 50rpx;
				flex-shrink: 0;
				transition: color .3s, font-weight .3s;
				margin-right: 40rpx;

				&:last-child {
					margin-right: 0;
				}

				&.active {
					color: #333;
					font-weight: bold;
				}
			}
		}

		&-slider {
			height: 8rpx;
			background: #333;
			border-radius: 4rpx;
			position: absolute;
			left: 0;
			bottom: 12rpx;
			transform: translateX(calc(var(--offset-x) - 50%));
			transition: width .3s, transform .3s;
		}
	}
</style>