<template>
	<nav-bar></nav-bar>
	<safe-area></safe-area>

	<view class="container">
		<view class="title">
			<view>正在组局</view>
			<cloud-file v-if="hasLogin" :src="userInfo" width="50rpx" height="50rpx" borderRadius="50%"
				@click="toEventSelf"></cloud-file>
		</view>

		<view class="">
			<view v-for="(item, index) in events" :key="index">
				<event-card :data="item" @click="toEventDetail(item._id)"></event-card>
			</view>
		</view>
	</view>

	<safe-area type="bottom"></safe-area>

	<float-button theme="dark" bottomHeight="20px" @click="createEvent"></float-button>
</template>

<script>
	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

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
		computed: {
			userInfo() {
				return store.userInfo;
			},
			hasLogin() {
				return store.hasLogin;
			}
		},
		methods: {
			toEventSelf() {
				uni.navigateTo({
					url: "/pages-fun/event/event-self/event-self"
				});
			},
			async getEvents() {
				let tempEvents = await db.collection("db-events").where(`deadline > new Date().getTime() && sec_check != 1`)
					.field("title, start_date, end_date, deadline, user_id, region, publish_date, participant_count")
					.orderBy("deadline").getTemp();
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
		},
		onPageScroll(e) {
			uni.$emit("onPageScroll", e.scrollTop);
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
		}
	}
</style>