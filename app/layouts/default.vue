<template>
  <div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import useDevice from '~/composables/useDevice'

const { isMobile } = useDevice()

provide('isMobile', isMobile)

function updateBodyClass() {
  if (import.meta.client) {
    document.body.classList[isMobile.value ? 'add' : 'remove']('is-mobile')
  }
}

onMounted(() => {
  updateBodyClass()
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.classList.remove('is-mobile')
  }
})

watch(isMobile, () => {
  updateBodyClass()
})
</script>
