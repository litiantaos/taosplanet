<template>
	<view class="container">
		<text>{{str}}</text>
	</view>
</template>

<script>
	export default {
		name: "short-name",
		props: {
			data: {
				type: String,
				default: ""
			}
		},
		data() {
			return {
				str: ""
			};
		},
		mounted() {
			this.handleStr();
		},
		methods: {
			handleStr() {
				let str = this.data;
				let names = ["省", "市", "壮族自治区", "回族自治区", "维吾尔自治区", "自治区", "特别行政区"];

				names.map(item => {
					if (str.indexOf(item) != -1) {
						let arr = str.split(item);
						this.str = arr[0];
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		display: inline-block;
	}
</style>