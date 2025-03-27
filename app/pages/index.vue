<template>
  <div class="repository-list-container">
    <h1>Docker Hub Repositories</h1>

    <el-table :data="repositories" size="large" style="width: 100%">
      <el-table-column prop="name" label="Repository" />
      <el-table-column prop="latestCount" label="Latest Pull Count">
        <template #default="scope">
          {{ formatNumber(scope.row.latestCount) }}
          <sup style="color: #f56c6c">
            +{{ formatNumber(scope.row.latestCount - scope.row.previousCount) }}
          </sup>
        </template>
      </el-table-column>
      <el-table-column prop="latestUpdate" label="Last Updated">
        <template #default="scope">
          {{ formatDate(scope.row.latestUpdate) }}
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="150" fixed="right">
        <template #default="scope">
          <el-button type="primary" @click="onViewStats(scope.row)"> View Stats </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
interface Repository {
  id: number
  namespace: string
  repository: string
  name: string
  latestCount: number
  latestUpdate: number
}

const { data: repositoriesData } = useFetch('/api/repositories')
const repositories = computed(() => repositoriesData.value?.repositories || [])

function onViewStats(repository: Repository) {
  navigateTo(`/statistics/${encodeURIComponent(repository.name)}`)
}

function formatNumber(num: number): string {
  return num ? num.toLocaleString() : '0'
}

function formatDate(timestamp: number): string {
  if (!timestamp) return 'N/A'

  const date = new Date(timestamp)
  return new Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
</script>

<style scoped>
.repository-list-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 24px;
  color: var(--el-color-primary);
}
</style>
