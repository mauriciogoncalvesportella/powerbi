<template>
  <q-card
    square
    style="background-color: rgba(0, 0, 0, 0)"
  >
    <q-chip
      v-show="factoryProps.code != null"
      :icon="menu === 'category' ? 'category' : 'build'"
      size="11.5px"
      square
      :label="factoryProps.label"
    />
    <q-chip
      v-show="teamProps.code != null"
      icon="group"
      size="11.5px"
      square
      :label="teamProps.label"
    />
    <q-toolbar
      class="lt-md bg-primary text-white shadow-2"
    >
      <q-toolbar-title
        class="text-weight-light text-subtitle2"
      >
        Lista de Produtos
      </q-toolbar-title>
    </q-toolbar>
    <div>
      <q-list
        class="lt-md"
      >
        <q-item
          v-for="(value, index) in chartData.values"
          :key="`q-item-${index}`"
          :class="index % 2 == 0 ? 'bg-grey-4' : 'bg-grey-2'"
          dense
        >
          <q-item-section
            side
          >
            <q-item-label
              class="text-black"
            >
              {{ chartData.ids[index] }}
            </q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ chartData.labels[index] }}
            </q-item-label>
          </q-item-section>
          <q-item-section
            side
            class="gt-sm"
          >
            <q-item-label>
              {{ chartData.quantities[index] }}
            </q-item-label>
          </q-item-section>
          <q-item-section
            side
            class="gt-sm"
          >
            <q-item-label>
              {{ number2currency(value/chartData.quantities[index]).replace('R$', '') }}
            </q-item-label>
          </q-item-section>
          <q-item-section
            side
            class="text-black"
          >
            <q-item-label
              class="lt-md"
              caption
            >
              {{ chartData.quantities[index] }}
            </q-item-label>
            <q-item-label
              class="truncate"
            >
              {{ number2currency(value).replace('R$', '') }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <q-markup-table
        square
        class="gt-sm"
        separator="horizontal"
        wrap-cells
      >
        <thead
          class="bg-primary text-white"
        >
          <tr>
            <th
              class="text-center"
              width="5%"
            >
              Código
            </th>
            <th
              class="text-left"
              width="65%"
            >
              Produto
            </th>
            <th
              class="text-right"
              width="10%"
            >
              Quantidade
            </th>
            <th
              class="text-right"
              width="15%"
            >
              Vl. Unitário
            </th>
            <th
              class="text-right"
              width="15%"
            >
              Faturamento
            </th>
          </tr>
        </thead>
        <tbody
          class="bg-grey-3"
        >
          <tr
            v-for="(value, index) in chartData.values"
            :key="`q-item-${index}`"
          >
            <td
              width="5%"
            >
              {{ chartData.ids[index] }}
            </td>
            <td
              width="65%"
            >
              {{ chartData.labels[index] }}
            </td>
            <td
              class="text-right"
              width="10%"
            >
              {{ chartData.quantities[index] }}
            </td>
            <td
              class="text-right"
              width="15%"
            >
              {{ number2currency(value/chartData.quantities[index]).replace('R$', '') }}
            </td>
            <td
              class="text-right"
              width="15%"
            >
              {{ number2currency(value).replace('R$', '') }}
            </td>
          </tr>
        </tbody>
      </q-markup-table>

      <q-inner-loading
        :showing="loading || externLoading"
        style="min-height: 640px"
      >
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>

      <div
        v-if="error"
        class="error full-width full-height"
      >
        <div
          class="row full-width full-height justify-center items-center no-data-inside"
        >
          <q-icon
            name="error"
            size="xl"
            color="negative"
          />
          <span
            class="text-weight-thin text-h6"
          >
            {{ error }}
          </span>
        </div>
      </div>

      <div
        v-else-if="noData || externNoData"
        class="column no-data justify-center items-center"
        style="min-height: 640px"
      >
        <q-icon
          name="cloud_off"
          color="primary"
          size="60px"
        />
        <span
          class="text-weight-light text-subtitle1 row items-center"
        >
          Sem dados no intervalo
        </span>
      </div>
    </div>
  </q-card>
</template>

<script lang="ts">
import { apiProvider } from 'src/boot/axios'
import { defineComponent, computed, PropType, ref, Ref } from 'vue'
import { FactoryResumeDTO } from 'src/dtos/sales/factory.dto'

export default defineComponent({
  props: {
    menu: { type: String as PropType<'factory' | 'category'>, default: 'factory' },
    code: { type: Number, required: false },
    type: { type: String, required: false },
    yearMonth: { type: String, required: false },
    teamProps: {
      type: Object as PropType<{ code: number | null, label: string | null }>,
      default: () => ({ code: null, label: null })
    },
    factoryProps: {
      type: Object as PropType<{ code: number | null, label: string | null }>,
      default: () => ({ code: null, label: null })
    },
    externLoading: { type: Boolean, required: false },
    externNoData: { type: Boolean, required: false }
  },

  setup (props) {
    const loading = ref(false)
    const error: Ref<string | null> = ref(null)
    const noData = ref(true)
    // const { yearMonth } = useYearMonthDropdown()
    const chartData: Ref<FactoryResumeDTO> = ref({
      codes: [],
      labels: [],
      values: [],
      ids: [],
      total_orders: [],
      quantities: []
    })

    const getData = async () => {
      return await apiProvider.axios.get<FactoryResumeDTO>(`bi/sales/${props.menu}/resume-product`, {
        params: {
          cd: props.code,
          type: props.type,
          'year-month': props.yearMonth,
          'cd-factory': props.factoryProps.code
        }
      })
    }

    const plot = async () => {
      if (props.factoryProps.code != null && !props.externNoData) {
        try {
          loading.value = true
          const response = await getData()
          chartData.value = response.data
          noData.value = response.data.codes.length === 0
        } catch (err: any) {
          error.value = err?.response?.status ?? 'Erro não identificado'
        } finally {
          loading.value = false
        }
      } else {
        chartData.value = {
          codes: [],
          labels: [],
          values: [],
          ids: [],
          quantities: [],
          total_orders: []
        }
      }
    }

    return {
      noData: computed(() => noData.value || props.factoryProps.code == null),
      error,
      loading,
      chartData,
      plot
    }
  }
})
</script>
