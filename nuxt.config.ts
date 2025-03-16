import path from 'path'
import fs from 'fs-extra'
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

  runtimeConfig: {
    dbPath: path.join(process.cwd(), 'data/database.sqlite3'),
  },

  hooks: {
    'nitro:build:public-assets': (nitro) => {
      fs.copySync(
        path.join(nitro.options.srcDir, 'migrations'),
        path.join(nitro.options.output.serverDir, 'migrations')
      )
    },
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

  cron: {
    runOnInit: false,
    timeZone: 'UTC',
    jobsDir: 'cron',
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
