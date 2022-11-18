<template>
  <q-btn-dropdown
    ref="dropdownComponent"
    color="primary"
    class="full-width"
    :disable="!user?.fgResponsavel"
    push
    :loading="loading"
  >
    <template v-slot:label>
      <div
        class="row full-width justify-left"
      >
        <span
          v-if="nodeMap[selected]"
        >
          {{ nodeMap[selected].label }}
        </span>
        <span
          v-else
        >
          {{ selected }}
        </span>
      </div>
    </template>
    <q-tree
      ref="treeComponent"
      :nodes="nodes"
      node-key="key"
      :loading="loading"
      v-model:selected="selected"
      v-model:expanded="expanded"
      @lazy-load="onLazyLoad"
      @update:selected="onUpdateSelected"
    />
  </q-btn-dropdown>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, nextTick, Ref } from 'vue'
import { useTeamDropdown } from 'src/reactive/TeamDropdown'
import { useAuth } from 'src/reactive/UseAuth'

export default defineComponent({
  props: {
    modelValue: Object // as { cd: Number, label: String, type: String }
  },
  emits: ['ready', 'update:modelValue'],
  setup (_, { emit }) {
    const dropdownComponent = ref(null) as Ref<any>
    const treeComponent = ref(null) as Ref<any>
    const {
      nodes,
      loading,
      error,
      selected,
      nodeMap,
      expanded,
      getData,
      updateSelected,
      init
    } = useTeamDropdown()
    const { user } = useAuth()

    onMounted(function () {
      const cd = user.value?.cdEquipe
      if (cd != null) {
        init(cd).then(() => {
          nextTick(() => {
            const node = nodeMap.value[selected.value]
            if (node) {
              emit('update:modelValue', { cd: node.cd, label: node.label, type: node.type })
            }
          })
        })
      }
    })

    return {
      user,
      nodes,
      loading,
      error,
      selected,
      nodeMap,
      expanded,
      getData,
      dropdownComponent,
      treeComponent,
      onLazyLoad: async ({ node, done }: any) => {
        done((await getData(node.cd)).childNodes)
      },
      onUpdateSelected () {
        const node = updateSelected()
        if (node) {
          emit('update:modelValue', node)
          dropdownComponent.value?.hide()
        }
      }
    }
  }
})
</script>
