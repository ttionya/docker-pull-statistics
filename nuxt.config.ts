import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,
  },

  modules: ['@nuxt/eslint', 'nuxt-cron', '@element-plus/nuxt', '@vueuse/nuxt'],

  runtimeConfig: {
    isProd: process.env.NODE_ENV === 'production',
    accessToken: process.env.ACCESS_TOKEN,
    databaseUri: process.env.DATABASE_URI || 'sqlite:data/database.sqlite',
  },

  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-11-01',

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

  cron: {
    runOnInit: false,
    timeZone: 'UTC',
    jobsDir: 'cron',
  },

  elementPlus: {
    icon: 'ElIcon',
    importStyle: 'scss',
  },

  vueuse: {
    ssrHandlers: true,
  },
})
