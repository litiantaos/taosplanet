<template>
	<cover-view v-if="isCover" class="cloud-file" @click="onClick"
		:style="{width, height, background, borderRadius, border}">
		<cover-image v-if="cSrc" :src="cSrc" class="image cover" :mode="mode"></cover-image>
	</cover-view>

	<view v-else class="cloud-file" @click="onClick" :style="{width, height, background, borderRadius, border}">
		<image v-if="cSrc" :src="cSrc" class="image" :mode="mode"></image>
	</view>
</template>

<script>
	export default {
		name: "cloud-file",
		props: {
			width: {
				type: String,
				default: "100rpx"
			},
			height: {
				type: String,
				default: "100rpx"
			},
			background: {
				type: String,
				default: "#ddd"
			},
			borderRadius: {
				type: String,
				default: "10rpx"
			},
			border: {
				type: String,
				default: "none"
			},
			src: {
				type: [String, Object]
			},
			mode: {
				type: String,
				default: "aspectFill"
			},
			isCover: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				cSrc: false
			};
		},
		watch: {
			src: {
				handler(src) {
					let isType = (type, obj) => {
						return Object.prototype.toString.call(obj) == `[object ${type}]`;
					}

					let str = "";
					let defaultSrc = "/static/images/avatar.svg";

					if (src && isType("Object", src)) {
						if (src.avatar_file) {
							str = src.avatar_file.url;
						} else if (src.user_id && src.user_id[0].avatar_file) {
							str = src.user_id[0].avatar_file.url;
						} else {
							str = defaultSrc;
						}
					} else if (src && isType("String", src)) {
						str = src;
					} else {
						str = defaultSrc;
					}

					if (str && str.substring(0, 8) == "cloud://") {
						uniCloud.getTempFileURL({
							fileList: [str]
						}).then(res => {
							this.cSrc = res.fileList[0].tempFileURL;
						});
					} else {
						this.cSrc = str;
					}
				},
				immediate: true
			}
		},
		methods: {
			onClick() {
				this.$emit("click");
			}
		}
	}
</script>

<style lang="scss" scoped>
	.cloud-file {
		overflow: hidden;

		.image {
			width: 100%;
			height: 100%;

			&.cover {
				z-index: 9;
			}
		}
	}
</style>