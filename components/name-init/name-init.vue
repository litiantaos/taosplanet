<template>
	<view class="text">{{str}}</view>
</template>

<script>
	export default {
		name: "name-init",
		props: {
			data: {
				type: [String, Object]
			}
		},
		data() {
			return {
				str: ""
			};
		},
		watch: {
			data: {
				handler(data) {
					if (data) {
						this.str = data.nickname || data || "Taoker";
					}
				},
				immediate: true
			}
		}
	}
</script>

<style lang="scss" scoped>
	.text {
		display: inline-block;
	}
</style>