<template>
  <q-drawer
    v-model="leftDrawerOpen"
    show-if-above
    bordered
    mini-to-overlay
    :mini="miniState"
    class="bg-grey-1 column justify-between"
    @mouseover="miniState = false"
    @mouseout="miniState = true"
  >
    <q-list>
      <q-item
        v-for="item in items"
        :key="item.title"
        clickable
        tag="a"
        active-class="active-class"
        :to="{ name: item.to }"
        @click="toggleLeftDrawer"
      >
        <q-item-section
          v-if="item.icon"
          avatar
        >
          <q-icon :name="item.icon" />
        </q-item-section>

        <q-item-section>
          <q-item-label>
            {{ item.title }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <q-item
      active
      active-class="sair-active-class"
      clickable
      @click="logout()"
    >
      <q-item-section
        avatar
      >
        <q-icon name="logout" />
      </q-item-section>
      <q-item-section>
        <q-item-label>
          Sair
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-drawer>
</template>

<script lang="ts">
import { emitter } from 'src/events'
import { useAuth } from 'src/reactive/UseAuth'
import { useQuasar } from 'quasar'
import { defineComponent, ref, onMounted, computed } from 'vue'
import UserRoles from 'src/utils/userRoles.utils'
import Routes from 'src/utils/routes'

export default defineComponent({
  setup () {
    const quasar = useQuasar()
    const auth = useAuth()
    const leftDrawerOpen = ref(false)
    const miniState = ref(true)
    const onlySupervisorOrUp = ['seller-status']
    const onlyDirector = ['profit']

    const items = ref([
      {
        id: 'revenue',
        title: 'Faturamento',
        icon: 'receipt_long',
        to: Routes.DASHBOARD_REVENUE,
        enabled: UserRoles.verifyRole('revenue')
      },
      {
        id: 'profit',
        title: 'Lucro',
        icon: 'paid',
        to: Routes.DASHBOARD_PROFIT,
        enabled: UserRoles.verifyRole('sales.profit')
      },
      {
        id: 'markup',
        title: 'Markup',
        icon: 'trending_up',
        to: Routes.DASHBOARD_MARKUP,
        enabled: UserRoles.verifyRole('sales.markup')
      },
      {
        id: 'comparative',
        title: 'Comparativo',
        icon: 'stacked_line_chart',
        to: Routes.DASHBOARD_COMPARATIVE,
        enabled: UserRoles.verifyRole('sales.comparative')
      },
      {
        id: 'linearity',
        title: 'Linearidade',
        icon: 'reorder',
        to: Routes.DASHBOARD_LINEARITY,
        enabled: UserRoles.verifyRole('sales.linearity')
      },
      {
        id: 'factory',
        title: 'Fabricante',
        icon: 'build',
        to: Routes.DASHBOARD_FACTORY,
        enabled: UserRoles.verifyRole('sales.factory')
      },
      {
        id: 'category',
        title: 'Categoria',
        icon: 'category',
        to: Routes.DASHBOARD_CATEGORY,
        enabled: UserRoles.verifyRole('sales.category')
      },
      {
        id: 'seller-status',
        title: 'Gerenciar Vendedores',
        icon: 'manage_accounts',
        to: Routes.DASHBOARD_MANAGEUSERS,
        enabled: UserRoles.verifyRole('manage_users')
      }
    ])

    items.value = items.value.filter(item => item.enabled)
    // if (auth.user.value?.fgFuncao === 1) {
    //   items.value = items.value.filter(item => !onlySupervisorOrUp.includes(item.id) && !onlyDirector.includes(item.id))
    // }

    // if (auth.user.value?.fgFuncao === 4) {
    //   items.value = items.value.filter(item => !onlyDirector.includes(item.id))
    // }

    // // CJM
    // if (auth.user.value?.cdEmpresaPublic === 40) {
    //   if (auth.user.value.fgFuncao !== 3) {
    //     items.value = items.value.filter(item => item.id !== 'markup')
    //   }

    //   if (auth.user.value.cdVendedor === 9999) {
    //     items.value = items.value.filter(item => item.id === 'linearity')
    //   }
    // }
    // // Fim

    // // Santa Gas
    // if (auth.user.value?.cdEmpresaPublic === 71) {
    //   if (auth.user.value.cdVendedor === 9999) {
    //     items.value = items.value.filter(item => item.id === 'linearity')
    //   }
    // }
    // // Fim

    const toggleLeftDrawer = () => {
      if (quasar.screen.lt.md) {
        leftDrawerOpen.value = !leftDrawerOpen.value
      } else {
        leftDrawerOpen.value = true
      }
    }

    onMounted(() => {
      emitter.on('toggleLeftDrawer', () => {
        toggleLeftDrawer()
      })
    })

    const behavior = computed(() => quasar.platform.is.mobile ? 'mobile' : 'default')

    const logout = () => {
      useAuth().logout()
    }

    return {
      onlySupervisorOrUp,
      onlyDirector,
      logout,
      behavior,
      toggleLeftDrawer,
      auth,
      leftDrawerOpen,
      miniState,
      items
    }
  }
})
</script>

<style lang="sass">
.active-class
  color: white
  background: $primary
.sair-active-class
  color: white
  background: $primary
</style>
