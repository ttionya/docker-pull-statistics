<template>
  <div class="repository-list-container">
    <h1>Docker Hub Repositories</h1>

    <el-table v-loading="loading" :data="repositories" style="width: 100%">
      <el-table-column prop="namespace" label="Namespace" width="180" />
      <el-table-column prop="repository" label="Repository" width="180" />
      <el-table-column prop="name" label="Name" />
      <el-table-column prop="latest_count" label="Latest Pull Count">
        <template #default="scope">
          {{ formatNumber(scope.row.latest_count) }}
        </template>
      </el-table-column>
      <el-table-column prop="latest_update" label="Last Updated">
        <template #default="scope">
          {{ formatDate(scope.row.latest_update) }}
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="120" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="viewStats(scope.row)">
            View Stats
          </el-button>
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
  latest_count: number
  latest_update: number
}

const { data: repositoriesData, pending } = useFetch('/api/repositories')
const repositories = computed(() => repositoriesData.value?.repositories || [])
const loading = computed(() => pending.value)

function formatNumber(num: number): string {
  return num ? num.toLocaleString() : '0'
}

function formatDate(timestamp: number): string {
  if (!timestamp) return 'N/A'

  const date = new Date(timestamp * 1000)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function viewStats(repository: Repository) {
  const repoPath = `${repository.namespace}/${repository.repository}`
  navigateTo(`/statistics/${encodeURIComponent(repoPath)}`)
}
</script>

<style scoped>
.repository-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 24px;
  color: var(--el-color-primary);
}
</style>
