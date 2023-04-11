<template>
	<nav-bar></nav-bar>
	<safe-area></safe-area>

	<view>
		<view class="input-area" :style="{transform: `translateY(${inputOffset})`}">
			<input-pro :inputIn="inputIn" @confirm="onConfirm" @focus="onFocus" @blur="onBlur"></input-pro>
		</view>

		<view class="container">
			<view v-for="(item, index) in users" :key="index">
				<user-card :data="item" :btnText="item.invited ? '已邀请' : '邀请'" :disabled="item.invited ? true : false"
					@handle="clickInvite(item, index)" @info="showInfo"></user-card>
			</view>
		</view>
	</view>

	<popup ref="popup"></popup>

	<toast ref="toast"></toast>
</template>

<script>
	import {
		store
	} from "@/uni_modules/uni-id-pages/common/store.js";

	const db = uniCloud.database();

	export default {
		data() {
			return {
				inputIn: {
					placeholder: "搜索恋人昵称",
					value: "",
					confirmType: "search"
				},
				inputOffset: `-50vh`,
				users: []
			};
		},
		methods: {
			showInfo() {
				this.$refs.toast.show({
					type: "info",
					text: "已邀请过TA了哦~",
					duration: "2000"
				});
			},
			clickInvite(item, index) {
				console.log(item);
				this.$refs.popup.show({
					type: "text",
					title: "提示",
					text: "你确定要邀请 " + item.nickname + " 吗？",
					success: () => {
						this.$refs.popup.hide();
						this.users[index].invited = true;

						uniCloud.callFunction({
							name: "push",
							data: {
								user_id: item._id,
								payload: {
									type: "relationship",
									content: "邀请你与TA关联为恋人",
									user_id: item._id,
									excerpt: "愿我如星君如月，夜夜流光相皎洁。",
									from_user_id: store.userInfo._id,
									from_user_name: store.userInfo.nickname,
									from_user_avatar: store.userInfo.avatar_file.url,
									date: Date.now()
								}
							}
						});
					}
				});
			},
			search() {
				let searchField = "nickname";

				db.collection("uni-id-users").where(`${new RegExp(this.inputIn.value, "i")}.test(${searchField})`)
					.field("_id, nickname, avatar_file, intro").get().then(res => {
						// console.log(res);
						this.users = res.result.data;
					});
			},
			onConfirm(e) {
				this.inputIn.value = e;
				this.search();
			},
			onBlur() {
				this.inputOffset = 0;
			},
			onFocus(e) {
				let keyboardHeight = e.detail.height;
				this.inputOffset = `calc(${-keyboardHeight}px + 55rpx)`;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.input-area {
		width: 100%;
		background: #f5f5f5;
		padding: 25rpx 25rpx calc(env(safe-area-inset-bottom) + 25rpx) 25rpx;
		position: fixed;
		left: 0;
		bottom: 0;
		transition: transform .3s;
		z-index: 999;
	}

	.container {
		width: 100%;
		padding: 25rpx 25rpx calc(env(safe-area-inset-bottom) + 150rpx) 25rpx;
	}
</style>