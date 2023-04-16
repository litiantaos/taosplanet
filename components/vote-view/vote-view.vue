<template>
	<view>
		<view class="options" v-for="(item, index) in options" :key="index">
			<view class="option" @click.stop="clickOption(item, index)">
				<view class="progress" :class="{'active': isChecked, 'checked': item.isChecked}"
					:style="{width: (isChecked ? `${item.vote_count / voteTotal * 100}%` : 0)}"></view>
				<text class="content">{{item.option_content}}</text>
				<text class="data" :class="{'active': isChecked}">{{item.vote_count / voteTotal * 100}}%</text>
			</view>
		</view>
		<view class="footer">
			<view class="text">{{voteTotal}}人参与</view>
			<view v-if="voteIn.vote_end_date > Date.now()" class="text">
				<uni-dateformat :date="voteIn.vote_end_date" format="M/d h:mm" :threshold="[60000, 3600000*24*30]">
				</uni-dateformat>结束
			</view>
			<view v-else class="text">投票已结束</view>
		</view>
	</view>
</template>

<script>
	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

	const db = uniCloud.database();
	const utils = uniCloud.importObject("utils", {
		customUI: true
	});

	export default {
		name: "vote-view",
		props: {
			data: {
				type: Array,
				default: []
			},
			voteIn: {
				type: Object,
				default: {}
			},
			voted: {
				type: String,
				default: ""
			}
		},
		data() {
			return {
				options: this.data,
				checked: "",
				isChecked: false,
				voteTotal: this.voteIn.vote_count
			};
		},
		watch: {
			voted(newVal) {
				if (newVal != "") {
					this.checked = newVal;
					this.isChecked = true;
				}
			}
		},
		methods: {
			add(item, index) {
				this.isChecked = true;
				this.options[index].isChecked = true;
				this.options[index].vote_count++;
				this.voteTotal++;
				this.checked = item._id;

				db.collection("db-votes").add({
					post_id: this.voteIn.post_id,
					option_id: item._id
				}).then(res => {});

				utils.calc("db-votes-options", "vote_count", item._id, 1);
				utils.calc("db-posts", "vote_count", this.voteIn.post_id, 1);
			},
			remove() {
				this.options.forEach((item, index) => {
					if (item._id == this.checked) {
						this.options[index].isChecked = false;
						this.options[index].vote_count--;
						this.voteTotal--;
					}
				});

				this.isChecked = false;

				db.collection("db-votes")
					.where(`option_id == "${this.checked}" && user_id == $cloudEnv_uid`)
					.remove();

				utils.calc("db-votes-options", "vote_count", this.checked, -1);
				utils.calc("db-posts", "vote_count", this.voteIn.post_id, -1);
			},
			clickOption(item, index) {
				if (!store.hasLogin) {
					this.$emit("voteLogin");
					return;
				}

				if (this.voteIn.vote_end_date > Date.now()) {
					if (this.isChecked) {
						if (this.checked == item._id) {
							this.remove();
						} else {
							this.remove();
							setTimeout(() => {
								this.add(item, index);
							}, 300);
						}
					} else {
						this.add(item, index);
					}
				} else {
					this.$emit("voteDate");
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.options {
		margin-bottom: 20rpx;

		.option {
			position: relative;
			width: 100%;
			height: 60rpx;
			background: #eee;
			border-radius: 15rpx;
			padding: 0 20rpx 0 25rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			line-height: 100%;
			overflow: hidden;

			.progress {
				position: absolute;
				top: 0;
				left: 0;
				width: 0;
				height: 100%;
				background: #ddd;
				transition: width .5s;

				&.checked {
					background: #c9d3ea;
				}
			}

			.content {
				font-size: 26rpx;
				color: #666;
				z-index: 9;
			}

			.data {
				font-size: 24rpx;
				color: #999;
				z-index: 9;
				opacity: 0;
				transition: opacity .5s;

				&.active {
					opacity: 1;
				}
			}
		}
	}

	.footer {
		display: flex;
		justify-content: space-between;
		font-size: 24rpx;
		color: #999;
	}
</style>