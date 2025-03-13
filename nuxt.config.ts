import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,
  },

  modules: ['@nuxt/eslint'],

  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-11-01',
})
