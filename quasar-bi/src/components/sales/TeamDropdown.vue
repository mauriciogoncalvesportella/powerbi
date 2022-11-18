<template>
  <q-btn-dropdown
    ref="dropdownComponent"
    color="primary"
    class="full-width"
    :disable="user.fgFuncao === 1"
    push
    :loading="loading"
  >
    <template v-slot:label>
      <div
        class="row full-width"
      >
        {{ user.fgFuncao === 1 ? user.nmVendedor : label }}
      </div>
    </template>

    <q-input
      ref="filterRef"
      square
      outlined
      v-model="filter"
      label="Pesquisar"
      dense
    >
      <template v-slot:append>
        <q-icon v-if="filter !== ''" name="clear" class="cursor-pointer" @click="filter = ''"/>
      </template>
    </q-input>

    <q-tree
      v-model:expanded="expanded"
      v-model:selected="selected"
      ref="treeComponent"
      :filter="filter"
      :nodes="nodes"
      node-key="key"
      no-results-label="Sem resultado"
      no-nodes-label="Vazio"
      :loading="loading"
      @update:selected="updateSelectedKey"
    />
  </q-btn-dropdown>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch, onMounted } from 'vue'
import { useTeamDropdown } from 'src/reactive/UseTeamDropdown'
import { useAuth } from 'src/reactive/UseAuth'
import { useYearMonthDropdown } from 'src/reactive/YearMonthDropdown'

export default defineComponent({
  setup () {
    const { yearMonth } = useYearMonthDropdown()
    const { user } = useAuth()
    const filter = ref('')
    const selected = ref('')
    let teamDropdownLoaded = false

    const {
      rootNode,
      loading,
      refresh,
      init,
      label,
      params,
      isCustomParams,
      selectedKey,
      updateSelectedKey
    } = useTeamDropdown()

    init()
    const expanded = ref([selectedKey.value])

    const refreshTeamDropdown = (force: boolean = false) => {
      if (!isCustomParams.value) {
        if ((!teamDropdownLoaded || force) && user.value && user.value.fgFuncao > 1 && yearMonth.value) {
          params.value = { teamCode: user.value.cdEquipe, interval: [yearMonth.value, yearMonth.value] }
          teamDropdownLoaded = true
          refresh()
        }
      }
    }

    watch(yearMonth, () => {
      refreshTeamDropdown(true)
    })

    onMounted(() => {
      refreshTeamDropdown()
    })

    return {
      updateSelectedKey,
      selected,
      filter,
      expanded,
      selectedKey,
      label,
      user,
      loading,
      refresh,
      nodes: computed(() => rootNode.value ? [rootNode.value] : [])
    }
  }
})
</script>
