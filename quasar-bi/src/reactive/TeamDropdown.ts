import { apiProvider } from 'src/boot/axios'
import { emitter } from 'src/events'
import { ref, computed, watch, Ref } from 'vue'
import { useAuth } from './UseAuth'
const { user } = useAuth()

export interface NodeTree {
  key: string,
  cd: number,
  label: string,
  lazy: boolean,
  type: string,
  children?: NodeTree[]
}

export interface TeamHeader {
  cd: number,
  type: string,
  label: string
}

// const scrollPosition = ref(0 as number)
const nodes = ref([] as NodeTree[])
const teamHeader: Ref<TeamHeader | undefined> = ref(undefined)
const loading = ref(false)
const error = ref('' as string)
const nodeMap = ref({} as Record<string, NodeTree>)
const expanded = ref([] as string[])
const selected = ref('' as string)
const memo: Record<number, { childNodes: NodeTree[], parentNode: NodeTree }> = {}

const teamsSellersFromTeam = async (cd: number): Promise<{ parentNode: NodeTree, childNodes: NodeTree[] }> => {
  if (cd in memo) {
    return memo[cd]
  }

  const childNodes: NodeTree[] = []
  const { data } = await apiProvider.axios.get<any>('bi/sales/equipe/teams-sellers-from-team', {
    params: { cd }
  })

  const parentKey = `team_${data.parentTeam.teamCode}`
  const parentNode = {
    key: parentKey,
    cd: data.parentTeam.teamCode,
    label: data.parentTeam.teamName,
    lazy: false,
    type: 'team',
    children: []
  }
  nodeMap.value[parentKey] = parentNode

  for (const item of [...data.childSellers, ...data.childTeams]) {
    const type = 'teamCode' in item ? 'team' : 'seller'
    const nodeKey = `${type}_${item.teamCode ?? item.sellerCode}`
    const node = {
      key: nodeKey,
      cd: item.teamCode ?? item.sellerCode,
      label: item.teamName ?? item.sellerName,
      lazy: type === 'team',
      type,
      children: type === 'team' ? [] : undefined
    }

    childNodes.push(node)
    nodeMap.value[nodeKey] = node
  }

  memo[cd] = { childNodes, parentNode }
  return { parentNode, childNodes }
}

const getData = async (cd: number): Promise<{ parentNode?: NodeTree, childNodes: NodeTree[] }> => {
  try {
    loading.value = true
    return await teamsSellersFromTeam(cd)
  } catch (err) {
    error.value = 'Erro ao carregar lista de times e vendedores'
    return {
      childNodes: []
    }
  } finally {
    loading.value = false
  }
}

const init = async (cd: number): Promise<NodeTree[]> => {
  if (!user.value?.fgResponsavel && user.value) {
    const nodeKey = `seller_${user.value.nmVendedor}`
    selected.value = nodeKey
    nodeMap.value[nodeKey] = {
      key: nodeKey,
      cd: user.value.cdVendedor,
      label: user.value.nmVendedor,
      type: 'seller',
      lazy: false
    }

    teamHeader.value = {
      cd: user.value.cdVendedor,
      label: user.value.nmVendedor,
      type: 'seller'
    }
    return []
  }

  if (nodes.value.length === 0) {
    const { parentNode, childNodes } = await getData(cd)
    if (parentNode) {
      parentNode.children = childNodes
      nodes.value = [parentNode]
      selected.value = parentNode.key
      expanded.value = [parentNode.key]
      teamHeader.value = { cd: parentNode.cd, label: parentNode.label, type: parentNode.type }
    }
  }
  return nodes.value
}

const updateSelected = (): any | null => {
  if (selected.value) {
    const node = nodeMap.value[selected.value]
    if (node) {
      teamHeader.value = { cd: node.cd, label: node.label, type: node.type }
      emitter.emit('updateTeamHeader', teamHeader.value)
      return teamHeader.value
    }
  }
  return null
}

watch(selected, (value, oldvalue) => {
  if (!value) {
    selected.value = oldvalue
  }
})

export function useTeamDropdown () {
  return {
    teamHeader,
    selected,
    expanded,
    getData,
    updateSelected,
    init,
    nodes: computed(() => nodes.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    nodeMap: computed(() => nodeMap.value)
  }
}
