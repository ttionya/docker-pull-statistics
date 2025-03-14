<template>
  <div class="stats-container">
    <div class="header">
      <el-page-header :title="repositoryName" @back="goBack" />
    </div>

    <div class="chart-controls">
      <el-radio-group v-model="dimension">
        <el-radio-button value="hour">Hourly</el-radio-button>
        <el-radio-button value="day">Daily</el-radio-button>
        <el-radio-button value="month">Monthly</el-radio-button>
      </el-radio-group>

      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="To"
        start-placeholder="Start date"
        end-placeholder="End date"
      />
    </div>

    <div v-loading="loading" class="chart-container">
      <div id="chart" ref="chartRef" style="width: 100%; height: 500px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { useEventListener } from '@vueuse/core'

const route = useRoute()
const repositoryName = decodeURIComponent(route.params.repo as string)
const dimension = ref('day')
const dateRange = ref<[Date, Date] | []>([])
const chartRef = ref<HTMLElement | null>(null)
const chart = ref<echarts.ECharts | null>(null)
const loading = ref(false)
const timezoneOffset = new Date().getTimezoneOffset()

onMounted(() => {
  initChart()
  loadData()
})

watch([dimension, dateRange], () => {
  loadData()
})

function initChart() {
  if (chartRef.value) {
    chart.value = echarts.init(chartRef.value)
  }
}

async function loadData() {
  if (!chart.value || !dateRange.value) return

  loading.value = true

  try {
    const startDate = dateRange.value[0] ? dateRange.value[0].getTime() : undefined
    const endDate = dateRange.value[1] ? dateRange.value[1].getTime() : undefined

    const { data } = await $fetch(`/api/statistics/count`, {
      query: {
        repository: repositoryName,
        from: startDate,
        to: endDate,
        dimension: dimension.value,
        timezone: timezoneOffset,
      },
    })

    const chartData = data || []
    updateChart(chartData)
  } catch (error) {
    console.error('Failed to fetch chart data:', error)
    ElMessage.error('Failed to load chart data')
  } finally {
    loading.value = false
  }
}

function updateChart(data: { time: string; count: number; delta: number }[]) {
  if (!chart.value) return

  const times = data.map((item) => item.time)
  const counts = data.map((item) => item.count)
  const deltas = data.map((item) => item.delta)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        show: true,
        type: 'cross',
        snap: true,
        label: {
          backgroundColor: '#6a7985',
        },
      },
    },
    legend: {
      data: ['Pull Count', 'Delta'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '13%',
      containLabel: true,
    },
    xAxis: {
      // type: 'category',
      // boundaryGap: false,
      data: times,
    },
    yAxis: [
      {
        type: 'value',
        name: 'Total Pulls',
      },
      {
        type: 'value',
        name: 'Delta',
        scale: true,
      },
    ],
    series: [
      {
        name: 'Pull Count',
        type: 'line',
        data: counts,
        itemStyle: {
          color: '#6b21a8',
        },
        label: { show: false },
      },
      {
        name: 'Delta',
        type: 'bar',
        yAxisIndex: 1,
        data: deltas,
        itemStyle: {
          color: '#f9a23c',
        },
      },
    ],
    dataZoom: [
      {
        type: 'slider',
        end: 100,
      },
    ],
  }

  chart.value.setOption(option)
}

function goBack() {
  navigateTo('/')
}

// Handle resize
useEventListener('resize', () => {
  chart.value?.resize()
})

// Cleanup
onUnmounted(() => {
  chart.value?.dispose()
})
</script>

<style scoped>
.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  margin-bottom: 24px;
}

.chart-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.chart-container {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  min-height: 500px;
}
</style>
