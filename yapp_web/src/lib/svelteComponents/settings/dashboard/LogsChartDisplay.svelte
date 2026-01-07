<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	export let logs: any[] = [];

	function prepareChartData(logs) {
	const countsByLevel = {
		INFO: Array(24).fill(0),
		WARN: Array(24).fill(0),
		ERROR: Array(24).fill(0),
		SECURITY: Array(24).fill(0),
		CRIT: Array(24).fill(0),
	};

	logs.forEach(log => {
		const date = new Date(log.timestamp);
		const hour = date.getHours(); // 0-23
		if (countsByLevel[log.level]) {
		countsByLevel[log.level][hour]++;
		}
	});

	return Object.entries(countsByLevel).map(([level, data]) => ({
		name: level,
		data,
	}));
	}

	// Transform logs into chart data
	$: options = {
		chart: {
			stacked: true,
			type: 'bar',
		},
		series: prepareChartData(logs),
		xaxis: {
			categories: Array.from({ length: 24 }, (_, i) => `${i}:00`),
		},
	};

  	let chart;

	onMount(async () => {
		const ApexCharts = (await import('apexcharts')).default;
		chart = new ApexCharts(document.getElementById("chart"), options);
		chart.render();
	});

	onDestroy(() => {
		if (chart) {
			chart.destroy();
		}
	});
</script>

<div id="chart"></div>