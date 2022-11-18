<template>
  <q-dialog
    v-model="show"
    :maximized="true"
  >
    <q-layout
      view="lHh lpr lFf"
      container
      class="shadow-2 rounded-borders bg-white"
    >
      <q-header elevated>
        <q-toolbar>
          <q-toolbar-title>
            {{ loading ? 'Carregando pedidos' : 'Pedidos' }}
          </q-toolbar-title>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-toolbar>
        <q-toolbar
          v-if="!loading && !error && orders.length > 0"
        >
          <div
            v-if="strategy === 'from-customer'"
          >
            <q-chip
              square
              icon="business"
            >
              {{ orders[0].customer.tradingName }}
              <q-tooltip>
                {{ orders[0].customer.name }}
              </q-tooltip>
            </q-chip>
            <q-chip
              v-if="baseParams.startYearMonth === baseParams.endYearMonth"
              square
              icon="date_range"
            >
              {{ baseParams.startYearMonth }}
            </q-chip>
            <q-chip
              v-else
              square
              icon="date_range"
            >
              de {{ baseParams.startYearMonth }} até {{ baseParams.endYearMonth }}
            </q-chip>
          </div>
          <div
            v-if="strategy === 'from-seller'"
          >
            <q-chip
              square
              icon="person"
            >
              {{ orders[0].seller.name }}
            </q-chip>

            <q-chip
              square
              icon="date_range"
            >
              <span v-if="baseParams.yearMonth">
                {{ baseParams.yearMonth }}
              </span>
              <span v-else-if="baseParams.initDay && baseParams.endDay && baseParams.initDay === baseParams.endDay">
                {{ $filters.date2format(new Date(`${baseParams.initDay} 00:00`), 'dd/MM/yyyy') }}
              </span>
              <span v-else>
                de {{ $filters.date2format(new Date(`${baseParams.initDay} 00:00`), 'dd/MM/yyyy') }}
                até {{ $filters.date2format(new Date(`${baseParams.endDay} 00:00`), 'dd/MM/yyyy') }}
              </span>
            </q-chip>
          </div>
        </q-toolbar>
      </q-header>

      <q-page-container
        class="bg-white full-width full-height"
      >
        <q-page>
          <q-inner-loading
            v-if="loading"
            :showing="true"
          >
            <q-spinner-gears size="12vw" color="primary" />
          </q-inner-loading>

          <q-list
            v-else-if="!error"
          >
            <q-virtual-scroll
              :items="orders"
              separator
              v-slot="{ item, index }"
            >
              <q-expansion-item
                group="somegroup"
                :class="index % 2 === 0 ? 'bg-grey-3' : ''"
              >
                <template
                  v-slot:header
                >
                  <div
                    class="full-width column"
                    style="width: 100%"
                  >
                    <div
                      class="text-caption col q-mb-sm"
                    >
                      <span>
                        {{ $filters.date2format(new Date(item.dates.issue), 'dd/MM/yyyy') }}
                        <q-tooltip> Data de Emissão </q-tooltip>
                      </span>
                      <span>
                        #{{ item.orderId }}
                        <q-tooltip> ID do pedido </q-tooltip>
                      </span>
                      <span
                        class="text-weight-bold"
                      >
                        {{ number2currency(item.values.products, true) }}
                        <q-tooltip> Valor dos produtos </q-tooltip>
                      </span>
                    </div>
                    <div
                      class="col-auto flex q-col-gutter-sm"
                    >
                      <template
                        v-if="strategy === 'from-customer'"
                      >
                        <div>
                          <q-icon name="person" />
                          {{ item.seller.name }}
                          <q-tooltip> Vendedor </q-tooltip>
                        </div>
                        <div>
                          <q-icon name="group" />
                          {{ item.seller.teamName }}
                          <q-tooltip> Equipe </q-tooltip>
                        </div>
                      </template>
                      <template
                        v-if="strategy === 'from-seller'"
                      >
                        <div>
                          <q-icon name="business" />
                          {{ item.customer.tradingName }}
                          <q-tooltip> Cliente </q-tooltip>
                        </div>
                      </template>
                      <div>
                        <q-icon name="paid" />
                        {{ item.paymentTerms.name }}
                        <q-tooltip> Tipo de pagamento </q-tooltip>
                      </div>
                      <div>
                        <q-icon name="local_grocery_store" />
                        {{ item.productResume.length }}
                        <q-tooltip> Quantidade de produtos </q-tooltip>
                      </div>
                    </div>
                  </div>
                </template>
                <q-card
                  :class="index % 2 === 0 ? 'bg-grey-3' : ''"
                >
                  <q-markup-table
                    dense
                    :class="index % 2 === 0 ? 'bg-grey-3' : ''"
                  >
                    <thead>
                      <tr>
                        <th class="text-left"> ID </th>
                        <th class="text-left"> Produto </th>
                        <th class="text-right"> Quantidade </th>
                        <th class="text-right"> Total </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="product in item.productResume"
                        :key="product.code"
                      >
                        <td class="text-left"> {{ product.id }} </td>
                        <td class="text-left"> {{ product.name }} </td>
                        <td class="text-right"> {{ product.quantity }} </td>
                        <td class="text-right"> {{ number2currency(product.total) }} </td>
                      </tr>
                    </tbody>
                  </q-markup-table>
                </q-card>
              </q-expansion-item>
            </q-virtual-scroll>
          </q-list>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>
</template>

<script lang="ts">
import { apiProvider } from 'src/boot/axios'
import { defineComponent, ref, Ref } from 'vue'
import { GetOrderListBase } from 'src/reactive/UseGlobalDialogs'
import { DateUtils } from 'src/utils/date.utils'

export default defineComponent({
  setup () {
    const show = ref(false)
    const loading = ref(false)
    const error = ref(false)
    const orders = ref([]) as Ref<any>
    const baseParams = ref({})
    const strategy = ref('')

    const open = (params: GetOrderListBase) => {
      strategy.value = params.strategy
      orders.value = []
      show.value = true
      loading.value = true
      error.value = false
      baseParams.value = params
      console.log(params)
      apiProvider.axios.get<any>(`bi/order-info/${params.strategy}`, { params })
        .then(response => {
          orders.value = response.data
          for (const order of orders.value) {
            order.dates.issue = DateUtils.dateToLocalDate(order.dates?.issue)
            order.dates.delivery = DateUtils.dateToLocalDate(order.dates?.issue)
          }
        })
        .catch(() => { error.value = true })
        .finally(() => { loading.value = false })
    }

    return {
      strategy,
      show,
      orders,
      open,
      loading,
      baseParams,
      error
    }
  }
})
</script>
