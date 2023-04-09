<template>
	<view class="chart">
		<l-echart ref="chart"></l-echart>
	</view>
</template>

<script>
	import * as echarts from "echarts/core";

	import {
		MapChart
	} from "echarts/charts";

	import {
		CanvasRenderer
	} from "echarts/renderers";

	echarts.use([
		MapChart,
		CanvasRenderer
	]);

	export default {
		data() {
			return {}
		},
		mounted() {
			this.$refs.chart.init(echarts, async chart => {
				const data = await this.getData();
				echarts.registerMap('WORLD', data);

				const option = {
					series: [{
						type: 'map',
						map: 'WORLD',
						data: [],
						nameMap: {}
					}]
				};

				chart.setOption(option);
			})
		},
		methods: {
			getData() {
				return new Promise(resolve => {
					uni.request({
						url: 'https://geojson.cn/api/data/china.json',
						success: res => {
							setTimeout(() => {
								resolve(res.data);
							}, 2000);
						}
					});
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.chart {
		width: 100vw;
		height: 100vh;
	}
</style>