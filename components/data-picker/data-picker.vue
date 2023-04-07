<template>
	<view class="data-picker">
		<tab class="tab" :tabs="tabs" :index="tabIndex" @change="tabChange" padding="0 0 25rpx 0"></tab>
		<scroll-view class="list" scroll-y>
			<view v-for="(list, listIndex) in lists" :key="listIndex">
				<view v-if="tabIndex == listIndex">
					<view v-for="(item, index) in list" :key="index">
						<view class="list_text" @click="clickItem(item)">{{item.name}}</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	const db = uniCloud.database();

	export default {
		name: "data-picker",
		props: {
			pickerIn: {
				type: Object,
				default: {
					tabs: ["全部"],
					levels: 2,
					col: "",
					levelField: "type",
					parentField: "parent_code",
					field: "_id, code, name",
					orderBy: "code"
				}
			}
		},
		data() {
			return {
				tabs: [],
				lists: [
					[]
				],
				tabIndex: 0,
				data: []
			};
		},
		mounted() {
			this.tabs = this.pickerIn.tabs;
			this.getData(0, null);
		},
		methods: {
			tabChange(e) {
				// console.log(e);
				this.tabIndex = e;
			},
			clickItem(e) {
				// console.log(e);

				let currLevel = e[this.pickerIn.levelField];
				let levels = this.pickerIn.levels;

				if (currLevel == levels - 1) {
					this.data.push(e.name, e.code, e._id);

					this.$emit("data", this.data);
				} else {
					if (this.tabs.length == levels) {
						this.tabs.splice(currLevel + 1, levels - currLevel - 1);
						this.data.splice(currLevel, levels - currLevel);
					}
					this.tabs.push(e.name);
					this.data.push(e.name);
					this.tabIndex = currLevel + 1;
					this.getData(currLevel + 1, e.code);
				}
			},
			getData(level, parent) {
				let pickerIn = this.pickerIn;

				let whereCond = "";

				if (parent == null) {
					whereCond = `"${pickerIn.levelField}" == ${level}`
				} else {
					whereCond = `"${pickerIn.levelField}" == ${level} && "${pickerIn.parentField}" == "${parent}"`
				}

				db.collection(pickerIn.col).where(`${whereCond}`)
					.field(pickerIn.field).orderBy(pickerIn.orderBy).get().then(res => {
						// console.log(res);
						this.lists[level] = res.result.data;
					});
			},
		}
	}
</script>

<style lang="scss" scoped>
	.data-picker {
		height: 100%;

		.list {
			width: 100%;
			height: 100%;

			&_text {
				font-size: 28rpx;
				line-height: 80rpx;
			}
		}
	}
</style>