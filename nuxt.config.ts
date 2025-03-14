import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,
  },

  modules: ['@nuxt/eslint', 'nuxt-cron'],

  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-11-01',

  cron: {
    runOnInit: true,
    timeZone: 'UTC',
    jobsDir: 'cron',
  },
})
