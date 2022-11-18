<template>
  <q-layout
    view="lHh Lpr lFf"
    class="main-layout"
  >
    <!--q-header elevated>
      <q-toolbar
        v-if="$q.screen.lt.md"
      >
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title
          class="row justify-end"
        >
          <q-breadcrumbs
            class="text-white text-overline"
            active-color="white"
          >
            <template v-slot:separator>
              <q-icon
                size="1.2em"
                name="arrow_forward"
                color="white"
              />
            </template>

            <q-breadcrumbs-el
              v-for="item in breadCrumbItems"
              :key="item"
              :label="item"
            />
          </q-breadcrumbs>
        </q-toolbar-title>
      </q-toolbar>
    </q-header-->

    <drawer
      ref="drawer"
    />

    <q-page-container>
      <router-view />
    </q-page-container>

    <update-version />
  </q-layout>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import Drawer from 'components/core/Drawer.vue'
import UpdateVersion from 'components/core/UpdateVersion.vue'

@Options({
  components: { Drawer, UpdateVersion }
})
export default class MainLayout extends Vue {
  confirm: boolean = true

  get breadCrumbItems () {
    return this.$route.path.split('/')
      .filter(path => path !== '')
  }

  toggleLeftDrawer () {
    const component = this.$refs.drawer as HTMLElement & any
    component.toggleLeftDrawer()
  }
}
</script>

<style lang="sass">
.main-layout
  background: $grey-2
</style>
