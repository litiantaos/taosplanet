<template>
	<nav-bar></nav-bar>
	<safe-area></safe-area>

	<view class="container">
		<view class="title">
			<view>正在组局</view>
			<view class="add-btn iconfont icon-add" @click="createEvent"></view>
		</view>

		<view class="">
			<view v-for="(item, index) in events" :key="index">
				<event-card :data="item" @click="toEventDetail(item._id)"></event-card>
			</view>
		</view>
	</view>
</template>

<script>
	const db = uniCloud.database();

	export default {
		data() {
			return {
				events: []
			};
		},
		onLoad() {
			this.getEvents();
		},
		methods: {
			async getEvents() {
				let tempEvents = await db.collection("db-events").where(`deadline > new Date().getTime() && sec_check != 1`)
					.field("title, start_date, end_date, deadline, user_id, region, publish_date")
					.orderBy("deadline desc").getTemp();
				let tempUsers = await db.collection("uni-id-users").field("_id, avatar_file, nickname").getTemp();

				let res = await db.collection(tempEvents, tempUsers).get();

				this.events = res.result.data;
				console.log(this.events);
			},
			toEventDetail(id) {
				uni.navigateTo({
					url: "/pages-fun/event/event-detail/event-detail?id=" + id
				});
			},
			createEvent() {
				uni.navigateTo({
					url: "/pages-fun/event/event-create/event-create"
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		padding: 25rpx;

		.title {
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: 80rpx;
			font-size: 45rpx;
			font-weight: bold;
			margin-bottom: 25rpx;

			.add-btn {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 100rpx;
				height: 50rpx;
				background: #333;
				border-radius: 25rpx;
				font-size: 24rpx;
				color: #fff;
			}
		}
	}
</style>