<template>
  <div class="page-container">
    <ClientOnly>
      <h1 class="page-title">Docker Hub Repositories</h1>

      <HomeContent :repositories="repositories" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { RepositoriesGetRsp } from '~~/types/api/repositories'

const { data: repositoriesData } = useFetch<RepositoriesGetRsp>('/api/repositories')

const repositories = computed(() => repositoriesData.value?.repositories || [])
</script>

<style lang="scss" scoped>
.page-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px;

  .is-mobile & {
    padding: 16px 12px;
  }
}

.page-title {
  margin-bottom: 20px;
  font-size: 24px;
  color: var(--el-color-primary);

  .is-mobile & {
    text-align: center;
  }
}
</style>
