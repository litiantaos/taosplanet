<template>
	<view>
		<tab :tabs="['我参与的', '我创建的']" padding="25rpx" background="#f5f5f5" @change="tabChange">
		</tab>
		<view class="tab-view">
			<view v-if="tabIndex == 0">
				<view v-for="(item, index) in participated" :key="index">
					<event-card :data="item" @click="toEventDetail(item._id)"></event-card>
				</view>
			</view>

			<view v-if="tabIndex == 1">
				<view v-for="(item, index) in created" :key="index">
					<event-card :data="item" @click="toEventDetail(item._id)"></event-card>
				</view>
			</view>
		</view>

		<safe-area type="bottom"></safe-area>
	</view>
</template>

<script>
	const db = uniCloud.database();
	const dbCmd = db.command;

	export default {
		data() {
			return {
				tabIndex: 0,
				participated: [],
				created: []
			};
		},
		onLoad() {
			this.getParticipatedEvents();
		},
		methods: {
			tabChange(e) {
				this.tabIndex = e;
				if (e == 1 && !this.created.length) {
					this.getCreatedEvents();
				}
			},
			async getParticipatedEvents() {
				let partRes = await db.collection("db-events-participants").where(`user_id == $cloudEnv_uid`)
					.orderBy("date desc").get();

				let eventIds = partRes.result.data.map(item => {
					return item.event_id;
				});

				let tempEvents = db.collection("db-events").where({
						_id: dbCmd.in(eventIds),
						sec_check: dbCmd.neq(1)
					})
					.field("title, start_date, end_date, deadline, user_id, region, publish_date, participant_count")
					.getTemp();
				let tempUsers = db.collection("uni-id-users").field("_id, avatar_file, nickname").getTemp();

				let res = await db.collection(tempEvents, tempUsers).get();

				this.participated = res.result.data;
				console.log(this.participated);
			},
			async getCreatedEvents() {
				let tempEvents = await db.collection("db-events").where(`user_id == $cloudEnv_uid && sec_check != 1`)
					.field("title, start_date, end_date, deadline, user_id, region, publish_date, participant_count")
					.orderBy("publish_date desc").getTemp();
				let tempUsers = await db.collection("uni-id-users").field("_id, avatar_file, nickname").getTemp();

				let res = await db.collection(tempEvents, tempUsers).get();

				this.created = res.result.data;
				console.log(this.created);
			},
			toEventDetail(id) {
				uni.navigateTo({
					url: "/pages-fun/event/event-detail/event-detail?id=" + id
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
	.tab-view {
		padding: 25rpx;
	}
</style>