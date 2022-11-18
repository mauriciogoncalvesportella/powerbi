import { Ref, ref, computed } from 'vue'

const factoryCode: Ref<number | null> = ref(null)

const factoryProps = ref({
  code: null as number | null,
  label: null as string | null
})

const teamProps = ref({
  code: null as number | null,
  label: null as string | null,
  type: null as ('seller' | 'team') | null
})

const setFactoryProps = (code: number, label: string) => {
  factoryProps.value = {
    code,
    label
  }
}

const resetFactoryProps = () => {
  factoryProps.value = {
    code: null,
    label: null
  }
}

const setTeamProps = (code: number, label: string, type: 'seller' | 'team') => {
  teamProps.value = {
    code,
    label,
    type
  }
}

const resetTeamProps = () => {
  teamProps.value = {
    code: null,
    label: null,
    type: null
  }
}

// OLD
const setFactoryCode = (code: number) => {
  factoryCode.value = code
}

const resetFactoryCode = () => {
  factoryCode.value = null
}

export function useFactory () {
  return {
    setFactoryProps,
    resetFactoryProps,
    setTeamProps,
    resetTeamProps,
    factoryProps: computed(() => factoryProps.value),
    teamProps: computed(() => teamProps.value),
    // OLD
    resetFactoryCode,
    setFactoryCode,
    factoryCode: computed(() => factoryCode.value)
  }
}
