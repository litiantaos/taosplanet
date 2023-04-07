<template>
	<scroll-view class="scroll-view" :class="isY ? 'scroll-y' : 'scroll-x'" :scroll-x="!isY" :scroll-y="isY" enable-flex>
		<view class="wrap" :class="{'scroll-y': isY}">
			<view class="item" :class="isY ? 'scroll-y' : 'scroll-x'" :style="`--hori-margin: ${horiMargin};`"
				v-for="(item, index) in list" :key="index">
				<slot :item="item" :index="index"></slot>
			</view>
		</view>
	</scroll-view>
</template>

<script>
	export default {
		name: "scroll-view-pro",
		props: {
			list: {
				type: Array,
				default: []
			},
			isY: {
				type: Boolean,
				default: false
			},
			horiMargin: {
				type: String,
				default: "0"
			}
		},
		data() {
			return {};
		}
	}
</script>

<style lang="scss" scoped>
	.scroll-view {
		width: 100%;
		box-sizing: border-box;

		&.scroll-x {
			white-space: nowrap;
		}

		&.scroll-y {
			display: flex;
			flex-wrap: wrap;
			height: 100%;
		}

		.wrap {
			&.scroll-y {
				padding: 0 50rpx;
			}

			.item {
				display: inline-block;
				width: fit-content;

				&.scroll-x {
					&:not(:last-child) {
						margin-right: $uni-spacing-base;
					}

					&:first-child {
						margin-left: var(--hori-margin);
					}

					&:last-child {
						margin-right: var(--hori-margin);
					}
				}

				&.scroll-y {
					&:not(:nth-child(3n)) {
						margin-right: 25rpx;
					}

					&:nth-child(n + 4) {
						margin-top: 25rpx;
					}
				}
			}
		}
	}
</style>