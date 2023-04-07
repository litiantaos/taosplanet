<template>
	<view>
		<picker-view class="picker-view" :value="value" @change="dateChange" indicator-class="indicator-class">
			<picker-view-column class="item" :class="{'multi': colList.length > 2}" v-for="(colItem, colIndex) in colList"
				:key="colIndex">
				<view v-for="(item, index) in colItem.list" :key="index">{{item}}
					<text class="text">{{colItem.text}}</text>
				</view>
			</picker-view-column>
		</picker-view>
	</view>
</template>

<script>
	export default {
		name: "date-picker",
		props: {
			dateIn: {
				type: Object,
				default: {
					value: [82, 0, 0],
					cols: ["year", "month", "day"]
				}
			}
		},
		data() {
			const date = new Date();
			const years = [];
			const months = [];
			const days = [];
			const hours = [];
			const minutes = [];

			let startYear = 1916;
			let maxMonth = 12;
			let maxDay = 31;
			let maxHour = 24;
			let maxMinute = 60;

			for (let i = startYear; i <= date.getFullYear() + 5; i++) {
				years.push(i);
			};
			for (let i = 1; i <= maxMonth; i++) {
				months.push(i);
			};
			for (let i = 1; i <= maxDay; i++) {
				days.push(i);
			};
			for (let i = 0; i < maxHour; i++) {
				hours.push(i);
			};
			for (let i = 0; i < maxMinute; i++) {
				minutes.push(i);
			};

			return {
				years,
				months,
				days,
				hours,
				minutes,
				startYear,
				maxMonth,
				maxDay,
				maxHour,
				maxMinute,
				value: [0, 0, 0],
				colList: []
			};
		},
		mounted() {
			this.value = this.dateIn.value;

			for (let i = 0; i < this.dateIn.cols.length; i++) {
				this.colList.push({});
			}

			let diff = [];

			this.dateIn.cols.forEach((item, index) => {
				if (item == "year") {
					this.colList[index].list = this.years;
					this.colList[index].text = "年";
					diff.push(this.startYear);
				} else if (item == "month") {
					this.colList[index].list = this.months;
					this.colList[index].text = "月";
					diff.push(1);
				} else if (item == "day") {
					this.colList[index].list = this.days;
					this.colList[index].text = "日";
					diff.push(1);
				} else if (item == "hour") {
					this.colList[index].list = this.hours;
					this.colList[index].text = "时";
					diff.push(0);
				} else if (item == "minute") {
					this.colList[index].list = this.minutes;
					this.colList[index].text = "分";
					diff.push(0);
				}
			});

			let data = this.dateIn.value.map((item, index) => {
				return item + diff[index];
			});

			let timestamp = this.process(data);

			this.dataHandler({
				data,
				timestamp
			});
		},
		methods: {
			toDouble(n) {
				if (n < 10) {
					return "0" + n;
				} else {
					return n;
				}
			},
			process(data) {
				let timestamp;
				let dateCols = ["year", "month", "day"];
				let timeCols = ["year", "month", "day", "hour", "minute"];
				let periodCols = ["year", "month", "year", "month"];

				if (this.dateIn.cols.toString() == dateCols.toString()) {
					let str = data[0] + "-" + this.toDouble(data[1]) + "-" + this.toDouble(data[2]);

					console.log(str);

					let date = new Date(str);
					timestamp = date.getTime();
				}

				if (this.dateIn.cols.toString() == timeCols.toString()) {
					let str = data[0] + "-" + this.toDouble(data[1]) + "-" + this.toDouble(data[2]) + " " +
						this.toDouble(data[3]) + ":" + this.toDouble(data[4]);

					let date = new Date(str);
					timestamp = date.getTime();
				}

				if (this.dateIn.cols.toString() == periodCols.toString()) {
					let str1 = data[0] + "-" + this.toDouble(data[1]) + "-01";
					let str2 = data[2] + "-" + this.toDouble(data[3]) + "-01";

					let date1 = new Date(str1);
					let date2 = new Date(str2);
					timestamp = [date1.getTime(), date2.getTime()];
				}

				return timestamp;
			},
			dataHandler(e) {
				this.$emit("data", e);
				console.log(e);
			},
			dateChange(e) {
				const val = e.detail.value;
				// console.log(val);

				let data = [];

				this.colList.forEach((item, index) => {
					data.push(item.list[val[index]]);
				});

				// console.log(data);

				let timestamp = this.process(data);

				this.dataHandler({
					data,
					timestamp
				});
			}
		}
	}
</script>

<style>
	.indicator-class {
		height: 100rpx;
	}
</style>

<style lang="scss" scoped>
	.picker-view {
		width: 100%;
		height: 400rpx;

		.item {
			font-size: 32rpx;
			line-height: 100rpx;
			text-align: center;

			&.multi {
				&:first-child {
					text-align: left;
				}

				&:last-child {
					text-align: right;
				}
			}

			.text {
				font-size: 22rpx;
				color: #999;
				margin-left: 10rpx;
			}
		}
	}
</style>