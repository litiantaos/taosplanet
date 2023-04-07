<template>
	<view>
		<nav-bar background="#fff"></nav-bar>
		<safe-area></safe-area>

		<view class="input-area">
			<input-pro :inputIn="inputIn" @confirm="onConfirm" @handle="onHandle"></input-pro>
		</view>

		<view class="container" :class="{'flex': !isSearch}">
			<view v-if="isSearch">
				<view class="list" v-for="(item, index) in searchRes" :key="index" @click="onClick(item)">{{item.name}}</view>
			</view>

			<view v-else>
				<view class="cards">
					<view class="card" v-for="(item, index) in colleges" :key="index" @click="onClick(item)">{{item.name}}</view>
				</view>

				<view class="tip">更多学校请搜索查找</view>
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
					placeholder: "搜索学校名称",
					value: "",
					confirmType: "search",
					suffixBtn: true,
					suffixBtnText: "取消"
				},
				colleges: [],
				isSearch: false,
				searchRes: []
			};
		},
		onLoad() {
			this.getColleges();
		},
		methods: {
			onClick(item) {
				console.log(item);
				let pages = getCurrentPages();
				let prevPage = pages[pages.length - 2];

				prevPage.$vm.data.college_id = item._id;
				prevPage.$vm.data.college_name = item.name;

				prevPage.$vm.tempData.college_id = item._id;
				prevPage.$vm.tempData.college_name = item.name;

				uni.navigateBack();
			},
			search() {
				let searchField = "name";

				db.collection("db-colleges").where(`${new RegExp(this.inputIn.value, "i")}.test(${searchField})`)
					.field("_id, name").get().then(res => {
						// console.log(res);
						this.searchRes = res.result.data;
					});
			},
			onHandle() {
				this.isSearch = false;
			},
			onConfirm(e) {
				this.inputIn.value = e;
				this.isSearch = true;
				this.search();
			},
			async getColleges() {
				let res = await db.collection("db-colleges").where(`peeli == 1`).field("_id, name").get();
				let arr = [];

				res.result.data.forEach(item => {
					arr.push(item);
				});

				this.colleges = arr;
			}
		}
	}
</script>

<style lang="scss">
	page {
		background: #fff;
	}
</style>

<style lang="scss" scoped>
	.input-area {
		width: 100%;
		background: #fff;
		padding: 25rpx 25rpx calc(env(safe-area-inset-bottom) + 25rpx) 25rpx;
		position: fixed;
		left: 0;
		bottom: 0;
		z-index: 999;
	}

	.container {
		width: 100%;
		padding: 25rpx 25rpx calc(env(safe-area-inset-bottom) + 150rpx) 25rpx;
		min-height: calc(100vh - 250rpx);

		&.flex {
			display: flex;
			flex-direction: column;
			justify-content: center;
		}

		.error {
			position: fixed;
			top: 0;
			left: 0;
			width: 100vw;
			height: 80vh;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 28rpx;
			pointer-events: none;
		}

		.list {
			width: 100%;
			font-size: 28rpx;
			color: #333;
			line-height: 100rpx;
		}

		.cards {
			width: 100%;
			display: flex;
			justify-content: center;
			flex-wrap: wrap;

			.card {
				padding: 10rpx 20rpx;
				background: #f5f5f5;
				border-radius: 10rpx;
				font-size: 24rpx;
				color: #333;
				margin: 10rpx;
			}
		}

		.tip {
			font-size: 24rpx;
			color: #999;
			text-align: center;
			margin-top: 100rpx;
		}
	}
</style>