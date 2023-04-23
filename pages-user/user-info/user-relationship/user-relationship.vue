<template>
	<nav-bar></nav-bar>
	<safe-area></safe-area>

	<view>
		<view class="input-area" :style="{transform: `translateY(${inputOffset})`}">
			<input-pro :inputIn="inputIn" @confirm="onConfirm" @focus="onFocus" @blur="onBlur"></input-pro>
			<view class="delete-relation" @click="deleteRelation">删除关联信息</view>
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
		store,
		mutations
	} from "@/uni_modules/uni-id-pages/common/store.js";

	const db = uniCloud.database();
	const dbCmd = db.command;
	const utils = uniCloud.importObject("utils", {
		customUI: true
	});
	const pushMsg = uniCloud.importObject("push-msg", {
		customUI: true
	});

	export default {
		data() {
			return {
				inputIn: {
					placeholder: "搜索恋人昵称",
					value: "",
					confirmType: "search"
				},
				inputOffset: `-40vh`,
				users: []
			};
		},
		methods: {
			deleteRelation() {
				this.$refs.popup.show({
					type: "text",
					title: "提示",
					text: "你确定要删除关联信息吗？",
					success: async () => {
						this.$refs.toast.show({
							type: "loading",
							text: "正在更新",
							duration: "none"
						});

						await utils.updateData("uni-id-users", store.userInfo._id, {
							lover_id: ""
						});

						await utils.updateData("uni-id-users", store.userInfo.lover_id, {
							lover_id: ""
						});

						this.$refs.toast.show({
							type: "success",
							text: "删除成功",
							duration: "2000"
						});

						this.$refs.popup.hide();

						mutations.updateUserInfo();

						setTimeout(() => {
							uni.navigateBack();
						}, 1000);
					}
				});
			},
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
					success: async () => {
						this.$refs.popup.hide();
						this.users[index].invited = true;

						let pushParam = {
							type: "relationship",
							content: "邀请你与TA关联为恋人",
							user_id: item._id,
							excerpt: "愿我如星君如月，夜夜流光相皎洁。",
							from_user_id: store.userInfo._id,
							from_user_name: store.userInfo.nickname,
							from_user_avatar: store.userInfo.avatar_file.url,
							date: Date.now()
						};

						await utils.addData("db-messages", pushParam).then(res => {
							pushParam._id = res.id;
						});

						pushMsg.sendMsg({
							user_id: item._id,
							payload: pushParam
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

		.delete-relation {
			font-size: 24rpx;
			color: #999;
			margin-top: 30rpx;
			text-align: center;
		}
	}

	.container {
		width: 100%;
		padding: 25rpx 25rpx calc(env(safe-area-inset-bottom) + 150rpx) 25rpx;
	}
</style>