<template>
	<view class="event-card" @click="onClick">
		<view class="content">
			<view class="title">{{data.title}}</view>
			<view class="tags">
				<view v-if="data.region" class="tag">
					<short-name :data="data.region.province"></short-name> ·
					<short-name :data="data.region.city"></short-name>
				</view>
				<view class="tag">
					<uni-dateformat :date="data.deadline" format="yyyy/MM/dd hh:mm"></uni-dateformat>
					截止
				</view>
			</view>
			<view class="participant">
				<avatar-group :avatars="avatars" borderColor="#7f9dde" radius="50rpx"></avatar-group>
				<view class="text">{{data.participant_count || 1}}人已参与</view>
			</view>
		</view>
		<view v-if="data.user_id && data.user_id[0].nickname" class="founder-wrap">
			<view class="founder">
				<view class="avatar">
					<cloud-file :src="data.user_id[0]" width="100%" height="100%"></cloud-file>
				</view>
				<view class="name">
					<name-init :data="data.user_id[0]"></name-init>
				</view>
			</view>

			<view class="description">
				<uni-dateformat :date="data.publish_date" format="yyyy/MM/dd"></uni-dateformat>
				发起
			</view>
		</view>
	</view>
</template>

<script>
	const db = uniCloud.database();

	export default {
		name: "event-card",
		props: {
			data: {
				type: Object,
				default: {}
			}
		},
		data() {
			return {
				avatars: []
			};
		},
		mounted() {
			this.getAvatars();
		},
		watch: {
			data() {
				this.getAvatars();
			}
		},
		methods: {
			async getAvatars() {
				let tempParticitants = await db.collection("db-events-participants")
					.where(`event_id == "${this.data._id}"`).orderBy("date desc").limit(5).getTemp();
				let tempUsers = await db.collection("uni-id-users").field("_id, avatar_file").getTemp();

				let res = await db.collection(tempParticitants, tempUsers).get();

				let resData = res.result.data.reverse();

				this.avatars = resData.map(item => {
					return item.user_id[0].avatar_file.url;
				});
			},
			onClick() {
				this.$emit("click");
			}
		}
	}
</script>

<style lang="scss" scoped>
	.event-card {
		width: 100%;
		background: #7f9dde;
		border-radius: 20rpx;
		overflow: hidden;
		margin-bottom: 25rpx;
		color: #fff;

		.content {
			width: 100%;
			padding: 25rpx;

			.title {
				font-size: 32rpx;
				font-weight: bold;
				margin: 10rpx 0 30rpx 0;
			}

			.tags {
				display: flex;
				margin-bottom: 35rpx;

				.tag {
					width: fit-content;
					padding: 5rpx 15rpx;
					border: 1px solid #fff;
					border-radius: 8rpx;
					font-size: 22rpx;
					margin-right: 15rpx;
				}
			}

			.participant {
				display: flex;
				align-items: center;

				.text {
					font-size: 26rpx;
					margin-left: 15rpx;
				}
			}
		}

		.founder-wrap {
			width: 100%;
			background: #7594d8;
			padding: 25rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;

			.founder {
				display: flex;
				align-items: center;

				.avatar {
					width: 50rpx;
					height: 50rpx;
					border: 1px solid #fff;
					border-radius: 50%;
					background: #eee;
					overflow: hidden;
				}

				.name {
					font-size: 28rpx;
					font-weight: bold;
					margin-left: 15rpx;
				}
			}

			.description {
				font-size: 26rpx;
			}
		}
	}
</style>