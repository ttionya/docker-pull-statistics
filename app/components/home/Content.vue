<script setup lang="ts">
import dayjs from 'dayjs'
import { isNumber } from '~/utils/typeCheck'
import type { Ref } from 'vue'
import type { RepositoryWithStats } from '~~/types/api/repositories'

const { repositories } = defineProps<{
  repositories: RepositoryWithStats[]
}>()

const isMobile = inject<Ref<boolean>>('isMobile')!

function goStatisticsPage(repository: RepositoryWithStats) {
  navigateTo(`/statistics/${repository.namespace}/${repository.repository}`)
}

function formatNumber(num?: number | null): string {
  if (!isNumber(num)) return 'N/A'

  return num ? num.toLocaleString() : '0'
}

function formatDate(date?: string | null): string {
  if (!date) return 'N/A'

  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<template>
  <div v-if="!isMobile" class="table-container">
    <el-table :data="repositories" size="large" style="width: 100%">
      <el-table-column label="Repository" min-width="250px">
        <template #default="{ row }">
          <el-link type="primary" @click="goStatisticsPage(row)">{{ row.name }}</el-link>
        </template>
      </el-table-column>

      <el-table-column label="Latest Pull Count" min-width="200px">
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
              <sup class="sup">
                +{{
                  formatNumber(
                    row.repositoryStats!.latestCount! - row.repositoryStats!.previousCount!
                  )
                }}
              </sup>
            </template>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column label="Last Updated" width="180px">
        <template #default="{ row }">
          {{ formatDate(row.repositoryStats?.latestUpdatedAt) }}
        </template>
      </el-table-column>
    </el-table>
  </div>

  <div v-else class="card-container">
    <el-card v-for="repository in repositories" :key="repository.id" class="card-item">
      <el-link class="title" type="primary" @click="goStatisticsPage(repository)">
        {{ repository.name }}
      </el-link>
      <div class="info">
        <div class="count">
          {{ formatNumber(repository.repositoryStats?.latestCount) }}
          <el-tooltip
            v-if="
              isNumber(repository.repositoryStats?.latestCount) &&
              isNumber(repository.repositoryStats?.previousCount)
            "
            placement="top"
            :content="`${formatDate(repository.repositoryStats?.previousUpdatedAt)} - ${formatDate(repository.repositoryStats?.latestUpdatedAt)}`"
          >
            <template #default>
              <sup class="sup">
                +{{
                  formatNumber(
                    repository.repositoryStats!.latestCount! -
                      repository.repositoryStats!.previousCount!
                  )
                }}
              </sup>
            </template>
          </el-tooltip>
        </div>
        <div class="date">{{ formatDate(repository.repositoryStats?.latestUpdatedAt) }}</div>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.sup {
  color: #f56c6c;
}

.card-container {
  .el-card {
    --el-card-padding: 16px;
  }

  .card-item {
    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  .title {
    margin-bottom: 8px;
    font-size: 16px;
    font-weight: 500;
  }

  .info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 16px;
    line-height: 24px;

    .date {
      margin: 4px 0 0 4px;
      font-size: 12px;
      color: gray;
    }
  }
}
</style>
