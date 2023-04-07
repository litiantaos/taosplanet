<template>
	<view>
		<view class="input-area" :style="{transform: `translateY(${inputOffset})`}">
			<input-pro :inputIn="inputIn" @confirm="onConfirm" @focus="onFocus" @blur="onBlur"></input-pro>
		</view>

		<view class="container">
			<view v-for="(item, index) in users" :key="index">
				<user-card :data="item" btnText="邀请"></user-card>
			</view>
		</view>
	</view>
</template>

<script>
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