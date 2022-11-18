<template>
  <q-dialog
    v-model="dialog"
    persistent
  >
    <q-card>
      <q-card-section class="row items-center">
        <q-icon
          name="notifications"
          size="sm"
          color="primary"
        />
        <span
          class="q-ml-sm text-weight-light text-subtitle1"
        >
          Nova versão de sistema disponível
        </span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          :label="`Atualizar (${count})`"
          color="primary"
          @click="update"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useAuth } from 'src/reactive/UseAuth'
import { Vue, Options } from 'vue-class-component'

@Options({})
export default class UpdateVersion extends Vue {
  dialog: boolean = false
  versionId: string = ''
  countInterval: any
  count: number = 20

  created () {
    this.$store.subscribe(({ type, payload }) => {
      if (!this.dialog && type === 'updateVersion') {
        this.count = 20
        this.versionId = payload
        this.dialog = true
      }
    })
  }

  mounted () {
    this.countInterval = setInterval(() => {
      this.count ? --this.count : this.update()
    }, 1e3)
  }

  async clearCache (reloadAfterClear = true) {
    if ('caches' in window) {
      for (const key of await caches.keys()) {
        await caches.delete(key)
      }
      if (reloadAfterClear) {
        window.location.reload()
      }
    }
  }

  update () {
    if (this.$store.state.updateVersion) {
      clearInterval(this.countInterval)
      localStorage.setItem('version', this.$store.state.updateVersion)
      const logout = this.versionId.includes('logout')
      this.clearCache(!logout)
      if (logout) {
        useAuth().logout()
      }
    }
  }
}
</script>
