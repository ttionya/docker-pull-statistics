<template>
  <div class="repository-list-container">
    <h1>Docker Hub Repositories</h1>

    <el-table :data="repositories" size="large" style="width: 100%">
      <el-table-column label="Repository">
        <template #default="{ row }">
          <el-link type="primary" @click="goStatisticsPage(row)">{{ row.name }}</el-link>
        </template>
      </el-table-column>

      <el-table-column label="Latest Pull Count">
        <template #default="{ row }">
          {{ formatNumber(row.repositoryStats?.latestCount) }}
          <el-tooltip
            v-if="
              isNumber(row.repositoryStats?.latestCount) &&
              isNumber(row.repositoryStats?.previousCount)
            "
            placement="top"
            :content="`${formatDate(row.repositoryStats?.previousUpdatedAt)} - ${formatDate(row.repositoryStats?.latestUpdatedAt)}`"
          >
            <template #default>
              <sup style="color: #f56c6c">
                +{{
                  formatNumber(
                    row.repositoryStats?.latestCount - row.repositoryStats?.previousCount
                  )
                }}
              </sup>
            </template>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column label="Last Updated">
        <template #default="{ row }">
          {{ formatDate(row.repositoryStats?.latestUpdatedAt) }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { isNumber } from '~/utils/typeCheck'

interface Repository {
  id: number
  namespace: string
  repository: string
  name: string
  repositoryStats?: {
    latestCount: number | null
    latestUpdatedAt: string | null
    previousCount: number | null
    previousUpdatedAt: string | null
  }
}

const { data: repositoriesData } = useFetch('/api/repositories')
const repositories = computed(() => repositoriesData.value?.repositories || [])

function goStatisticsPage(repository: Repository) {
  navigateTo(`/statistics/${repository.namespace}/${repository.repository}`)
}

function formatNumber(num?: number): string {
  if (!isNumber(num)) return 'N/A'

  return num ? num.toLocaleString() : '0'
}

function formatDate(date?: string): string {
  if (!date) return 'N/A'

  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
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
