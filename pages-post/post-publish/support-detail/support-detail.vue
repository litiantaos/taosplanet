<template>
	<view class="container">
		<view class="intro">
			因微信平台限制，外部链接均需配置后方可访问，现暂支持以下链接，如有新增需要可联系社区管理员。
		</view>

		<view class="list">
			<view class="item" v-for="(item, index) in list" :key="index">
				<view class="pri">{{item.name}}</view>
				<view class="sec">{{item.url}}</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list: [{
						name: "微信公众号",
						url: "mp.weixin.qq.com/"
					},
					{
						name: "基金会官网",
						url: "tspef.org/"
					},
					{
						name: "GitHub",
						url: "github.com/"
					},
					{
						name: "石墨文档",
						url: "shimo.im/"
					},
					{
						name: "Notion",
						url: "notion.so/"
					},
					{
						name: "问卷星",
						url: "wjx.cn/"
					},
					{
						name: "哔哩哔哩",
						url: "bilibili.com/"
					},
					{
						name: "微博",
						url: "weibo.com/"
					},
					{
						name: "",
						url: ""
					},
				]
			};
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		padding: 35rpx;
		font-size: 28rpx;
		color: #333;

		.intro {
			margin-bottom: 30rpx;
			line-height: 50rpx;
		}

		.list {
			width: 100%;
			padding: 10rpx 30rpx;
			background: #fff;
			border-radius: 20rpx;

			.item {
				display: flex;
				line-height: 80rpx;

				.pri {
					width: 220rpx;
				}
			}
		}
	}
</style>