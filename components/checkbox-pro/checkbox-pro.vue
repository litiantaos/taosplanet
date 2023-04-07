<template>
	<scroll-view-pro class="checkbox-pro" :isY="true" :list="list" v-slot="{item, index}">
		<view class="item" :class="{'active': item.checked}" @click="onClick(item, index)">{{item.name}}</view>
	</scroll-view-pro>
</template>

<script>
	export default {
		name: "checkbox-pro",
		props: {
			list: {
				type: Array,
				default: []
			},
		},
		data() {
			return {

			};
		},
		methods: {
			onClick(item, index) {
				// console.log(e);
				this.$emit("change", {
					index,
					...item
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.checkbox-pro {
		.item {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			width: 200rpx;
			height: 200rpx;
			background: #eee;
			border-radius: 20rpx;
			font-size: 24rpx;
			color: #333;

			&.active {
				border: 2px solid #666;
			}
		}
	}
</style>