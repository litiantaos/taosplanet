<template>
	<view class="container">
		<view class="title">{{data.title}}</view>
		<view class="info">
			<view v-if="data.user_id" class="user">
				<cloud-file class="avatar" :src="data.user_id[0]" width="40rpx" height="40rpx" borderRadius="50%"></cloud-file>
				<view class="username">{{data.user_id[0].nickname}}</view>
			</view>
			<view class="tag">{{data.industry_name}}</view>
		</view>

		<view class="parse">
			<parse-pro :content="data.content" :tagStyle="style" selectable lazyLoad></parse-pro>
		</view>
	</view>
</template>

<script>
	import {
		getTempFileURL
	} from "@/common/cloud.js";

	const db = uniCloud.database();

	export default {
		data() {
			return {
				projectId: "",
				data: {},
				style: {
					h2: "margin-bottom: 20rpx; font-size: 36rpx;",
					p: "line-height: 1.6;"
				}
			};
		},
		onLoad(e) {
			this.projectId = e.id;

			this.getData();
		},
		methods: {
			async replaceImgSrc(html) {
				const imgRegex = /<img [^>]*src=['"]([^'"]+)['"][^>]*>/gi;
				const imgTags = html.match(imgRegex);

				const srcRegex = /src=['"]([^'"]+)['"]/i;
				const srcUrls = imgTags.map(tag => {
					const match = srcRegex.exec(tag);
					return match[1];
				});

				const cSrcs = await getTempFileURL(srcUrls);

				let result = html;

				cSrcs.forEach((cSrc, i) => {
					result = result.replace(srcUrls[i], cSrc);
				});

				return result;
			},

			async getData() {
				let tempProject = db.collection("db-projects").where(`_id == "${this.projectId}"`).getTemp();
				let tempUser = db.collection("uni-id-users").field("_id, avatar_file, nickname").getTemp();

				let res = await db.collection(tempProject, tempUser).get();

				console.log(res);

				let resData = res.result.data[0];
				resData.content = await this.replaceImgSrc(resData.content);
				// console.log(resData);

				this.data = resData;
			}
		}
	}
</script>

<style>
	page {
		background: #fff;
	}
</style>

<style lang="scss" scoped>
	.container {
		padding: 25rpx;

		.title {
			font-size: 48rpx;
			font-weight: bold;
		}

		.info {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin: 25rpx 0;
		}

		.user {
			display: flex;
			align-items: center;

			.avatar {
				width: 40rpx;
				height: 40rpx;
				border-radius: 50%;
				background: #eee;
				margin-right: 15rpx;
			}

			.username {
				font-size: 28rpx;
				color: #666;
			}
		}

		.tag {
			font-size: 24rpx;
			color: #666;
			width: fit-content;
			padding: 10rpx 20rpx;
			background: #eee;
			border-radius: 15rpx;
		}

		.parse {
			color: #333;
			margin-top: 30rpx;
		}
	}
</style>