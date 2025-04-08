<script setup lang="ts">
import * as echarts from 'echarts'
import { useEventListener } from '@vueuse/core'
import dayjs from 'dayjs'
import dayjsUtc from 'dayjs/plugin/utc.js'
import type { Ref } from 'vue'
import type { StatisticsCountGetReq, StatisticsCountGetRes } from '~~/types/api/statistics'

dayjs.extend(dayjsUtc)

const isMobile = inject<Ref<boolean>>('isMobile')!
const route = useRoute()
const repositoryName = `${route.params.namespace as string}/${route.params.repository as string}`
const chartHeight = ref(0)
const dimension = ref<StatisticsCountGetReq['dimension']>('day')
const dateRange = ref<[Date, Date] | []>([])
const loading = ref(false)
const resTimezoneOffset = ref(0)
const chartControlsRef = ref<HTMLElement | null>(null)
const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

onMounted(() => {
  updateChartHeight()
  initChart()
  loadData()
})

watch([dimension, dateRange], () => {
  loadData()
})

function initChart() {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
  }
}

async function loadData() {
  if (!chart) return

  loading.value = true

  try {
    const range = dateRange.value || []
    const startDate = range[0] ? range[0].getTime() : undefined
    const endDate = range[1] ? range[1].getTime() : undefined

    const query: StatisticsCountGetReq = {
      repository: repositoryName,
      from: startDate,
      to: endDate,
      dimension: dimension.value,
      timezoneOffset: new Date().getTimezoneOffset(),
    }

    const { data, timezoneOffset } = await $fetch<StatisticsCountGetRes>(`/api/statistics/count`, {
      query,
    })

    resTimezoneOffset.value = timezoneOffset

    updateChart(data || [])
  } catch (error) {
    console.error('Failed to fetch chart data:', error)
    ElMessage.error('Failed to load chart data')
  } finally {
    loading.value = false
  }
}

function updateChart(data: StatisticsCountGetRes['data']) {
  if (!chart) return

  const times = data.map((item) => {
    let format = 'YYYY-MM-DD HH:mm'

    switch (dimension.value) {
      case 'month':
        format = 'YYYY-MM'
        break
      case 'day':
        format = 'YYYY-MM-DD'
        break
    }

    return dayjs(item.time)
      .utcOffset(resTimezoneOffset.value * -1)
      .format(format)
  })
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
      left: '2%',
      right: '2%',
      bottom: '60px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
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

  chart.setOption(option)
  chart?.resize()
}

function goBack() {
  navigateTo('/')
}

function updateChartHeight() {
  const chartControlsHeight = chartControlsRef.value?.offsetHeight || 0

  chartHeight.value = window.innerHeight - chartControlsHeight - 150
}

// Handle resize
useEventListener('resize', () => {
  updateChartHeight()
  nextTick(() => {
    chart?.resize()
  })
})

// Cleanup
onUnmounted(() => {
  chart?.dispose()
})
</script>

<template>
  <div class="page-container">
    <div class="header">
      <el-page-header :title="repositoryName" @back="goBack">
        <template #content>
          <el-link
            :href="`https://hub.docker.com/r/${repositoryName}`"
            :underline="false"
            target="_blank"
          >
            <img class="docker-icon" src="~/assets/images/docker.svg" alt="Go to Docker hub" />
          </el-link>
        </template>
      </el-page-header>
    </div>

    <div ref="chartControlsRef" class="chart-controls">
      <el-radio-group v-model="dimension" class="control-item">
        <el-radio-button value="hour">Hourly</el-radio-button>
        <el-radio-button value="day">Daily</el-radio-button>
        <el-radio-button value="month">Monthly</el-radio-button>
      </el-radio-group>

      <div class="control-item">
        <ClientOnly>
          <el-date-picker
            v-model="dateRange"
            popper-class="repository-control-date-picker"
            type="daterange"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            :editable="false"
            :style="{ width: isMobile ? '320px' : '400px' }"
          />
        </ClientOnly>
      </div>
    </div>

    <div v-loading="loading" class="chart-container">
      <div id="chart" ref="chartRef" :style="`width: 100%; height: ${chartHeight}px`" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-container {
  padding: 16px;
}

.header {
  margin-bottom: 24px;

  .docker-icon {
    width: 16px;
    height: 16px;
  }
}

.chart-controls {
  display: flex;
  flex-wrap: wrap;

  .control-item {
    margin: 0 16px 16px 0;

    &:last-child {
      margin-right: 0;
    }
  }
}

.chart-container {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  min-height: 500px;
}
</style>

<style lang="scss">
@media screen and (max-width: 768px) {
  .repository-control-date-picker {
    .el-picker-panel__sidebar {
      width: 100%;
    }

    .el-picker-panel {
      width: 350px !important;
    }

    .el-picker-panel__content {
      width: 100%;
    }

    .el-picker-panel__body {
      display: flex;
      flex-direction: column;
      min-width: auto !important;
      margin-left: 0 !important;
    }

    .el-picker-panel__sidebar {
      position: relative;
    }

    .el-picker-panel__body-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  }
}
</style>
