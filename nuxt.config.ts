import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,
  },

  modules: ['@nuxt/eslint', 'nuxt-cron', '@element-plus/nuxt', '@vueuse/nuxt'],

  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-11-01',

  cron: {
    runOnInit: false,
    timeZone: 'UTC',
    jobsDir: 'cron',
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `@use "~/assets/styles/element.scss" as element;`,
        },
      },
    },
  },

  elementPlus: {
    icon: 'ElIcon',
    importStyle: 'scss',
    defaultLocale: 'zh-cn',
  },

  vueuse: {
    ssrHandlers: true,
  },
})
