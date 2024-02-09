<template>
  <q-btn-dropdown
    ref="dropdownComponent"
    color="primary"
    class="full-width"
    :disable="!enabled"
    :loading="loading"
  >
    <template v-slot:label>
      <div
        class="row full-width"
      >
        {{ team?.label }}
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
      v-model:selected="selectedKey"
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
import { defineComponent, computed, ref } from 'vue'
import { useTeamDropdown } from 'src/reactive/UseTeamDropdown'
import { useAuth } from 'src/reactive/UseAuth'

export default defineComponent({
  setup () {
    // const { yearMonth } = useYearMonthDropdown()
    const { user } = useAuth()
    const filter = ref('')
    const selected = ref('')

    const {
      rootNode,
      loading,
      refresh,
      selectedKey,
      enabled,
      updateSelectedKey,
      team
    } = useTeamDropdown()

    const expanded = ref([selectedKey.value])

    return {
      updateSelectedKey,
      selected,
      filter,
      expanded,
      selectedKey,
      team,
      user,
      loading,
      refresh,
      enabled,
      nodes: computed(() => rootNode.value ? [rootNode.value] : [])
    }
  }
})
</script>
