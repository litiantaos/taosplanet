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
					let isType = (type, obj) => {
						return Object.prototype.toString.call(obj) == `[object ${type}]`;
					}

					const defaultName = "Taoker";

					if (data && isType("Object", data)) {
						if (data.nickname) {
							this.str = data.nickname;
						} else {
							this.str = defaultName;
						}
					} else if (data && isType("String", data)) {
						this.str = data;
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