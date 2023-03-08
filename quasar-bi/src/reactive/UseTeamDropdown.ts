import { apiProvider } from 'src/boot/axios'
import { ref, Ref, computed, watch } from 'vue'
import { useAuth } from './UseAuth'

const { user } = useAuth()

interface DropdownNodeDTO {
  key: string,
  code: number,
  label: string,
  type: string,
  children?: DropdownNodeDTO[]
}

interface GetdataParams {
  teamCode: number,
  interval: string[]
}

export interface DropdownNode extends DropdownNodeDTO {}
let initialized = false
const lastRefreshed = { teamCode: 0 as number, interval: [] as string[] }
const selectedKey = ref('')
const loading = ref(false)
const error: Ref<string | undefined> = ref(undefined)
const rootNode = ref(undefined) as Ref<DropdownNode | undefined>
const map: Ref<Record<string, DropdownNodeDTO>> = ref({})
const updateSelected: Ref<(status: 'no-data' | 'loaded' | 'loading', team?: DropdownNode) => void> = ref(() => ({}))
const label: Ref<string> = ref('')
const params: Ref<GetdataParams | undefined> = ref(undefined)
const isCustomParams = ref(false)

const getData = async (): Promise<DropdownNodeDTO | undefined> => {
  try {
    loading.value = true
    error.value = undefined
    const { data } = await apiProvider.axios.get<DropdownNodeDTO>('bi/sales/team-drop-down/nodes', {
      params: {
        'team-code': params.value?.teamCode,
        interval: params.value?.interval
      }
    })
    return data
  } catch (err: any) {
    error.value = err.response.status
  } finally {
    loading.value = false
  }
}

const floodFill = () => {
  const checked: Record<string, boolean> = {}
  function recursive (node?: DropdownNode) {
    if (node && !checked[node.key]) {
      checked[node.key] = true
      map.value[node.key] = node
      for (const child of node.children ?? []) {
        recursive(child)
      }
    }
  }
  recursive(rootNode.value)
}

const nodeHasSeller = (node: DropdownNode) => {
  let hasSeller = false
  function recursive (node: DropdownNode) {
    if (!hasSeller) {
      for (const child of node.children ?? []) {
        if (child.type === 'seller') {
          hasSeller = true
        }
        recursive(child)
      }
    }
  }
  recursive(node)
  return hasSeller
}

const isLastRefreshed = () => {
  const teamCode = params.value?.teamCode
  const interval = params.value?.interval

  if (!teamCode || !interval) { return false }
  if (teamCode === lastRefreshed.teamCode &&
      interval[0] === lastRefreshed.interval[0] &&
      interval[1] === lastRefreshed.interval[1]) {
    return true
  }

  lastRefreshed.teamCode = teamCode
  lastRefreshed.interval = interval
  return false
}

const refresh = async () => {
  if (user.value && user.value?.fgFuncao > 1) {
    if (!isLastRefreshed()) {
      map.value = {}
      rootNode.value = await getData()
      floodFill()
    }
    const node = map.value[selectedKey.value]
    if (node && (node.type === 'seller' || nodeHasSeller(node))) {
      updateSelected.value('loaded', node)
    } else {
      updateSelected.value('no-data', node)
    }
  }
}

const init = () => {
  if (!initialized) {
    initialized = true
    if (user.value?.fgFuncao === 1) {
      map.value[`seller_${user.value.cdVendedor}`] = {
        key: `seller_${user.value.cdVendedor}`,
        label: user.value.nmVendedor,
        code: user.value.cdVendedor,
        type: 'seller'
      }
      selectedKey.value = `seller_${user.value?.cdVendedor}`
    } else {
      selectedKey.value = `team_${user.value?.cdEquipe}`
    }
  }
}

const updateSelectedKey = (value?: string) => {
  if (value) {
    selectedKey.value = value
    updateSelected.value('loaded', map.value[value])
  }
}

/* Computed */
const team = computed((): DropdownNode | undefined => {
  return loading.value
    ? undefined
    : map.value[selectedKey.value] ?? undefined
})

const status = computed((): 'loading' | 'loaded' | 'no-data' => {
  if (loading.value) {
    return 'loading'
  }
  const node = map.value[selectedKey.value]
  if (node && ((node.type === 'team' && nodeHasSeller(node)) || node.type === 'seller')) {
    return 'loaded'
  }
  return 'no-data'
})

/* Watchers */
watch(team, value => {
  if (value) {
    label.value = value.label
  }
})

/* Componentes Page utilizam o parâmetro "customParams" */
export function useTeamDropdown (customParams: boolean | undefined = undefined) {
  if (customParams !== undefined) {
    isCustomParams.value = customParams
  }

  return {
    isCustomParams: computed(() => isCustomParams.value),
    params,
    label,
    updateSelectedKey,
    updateSelected,
    map,
    selectedKey,
    init,
    status,
    team,
    rootNode,
    loading,
    refresh
  }
}
