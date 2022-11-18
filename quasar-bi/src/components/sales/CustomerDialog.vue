<template>
  <q-dialog
    v-model="show"
  >
    <q-card
      style="width: 450px; max-width: 80vw;"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ loading ? 'Carregando Cliente' : 'Cliente' }}
        </div>
        <q-space />
        <q-btn
          v-show="!loading"
          icon="close"
          flat
          round
          dense
          v-close-popup
        />
      </q-card-section>

      <q-card-section>
        <q-linear-progress
          v-if="loading"
          dark
          rounded
          indeterminate
        />
        <template
          v-else-if="error"
        >
          Erro ao carregar Cliente
        </template>
        <template
          v-else
        >
          <q-input
            v-for="(value, key) in customer"
            :key="key"
            square
            outlined
            dense
            readonly
            class="q-ma-xs"
            :model-value="value"
            :label="mapLabel[key]"
          />
        </template>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { apiProvider } from 'src/boot/axios'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup () {
    const show = ref(false)
    const loading = ref(true)
    const error = ref(false)
    const customer = ref({})

    const open = (code: number) => {
      show.value = true
      loading.value = true
      error.value = false
      apiProvider.axios.get<any>(`bi/customer/${code}`)
        .then(response => { customer.value = response.data })
        .catch(() => { error.value = true })
        .finally(() => { loading.value = false })
    }

    const mapLabel = {
      code: 'Código',
      customerId: 'ID',
      cnpjOrCpfCode: 'CNPJ ou CPF',
      companyName: 'Razão Social',
      tradingName: 'Nome Fantasia',
      sellerCode: 'Código Vendedor',
      districtName: 'Bairro',
      cityName: 'Cidade',
      stateName: 'Estado',
      phoneId: 'Telefone Principal',
      phone2Id: 'Telefone Segundário',
      mobilePhoneId: 'Celular',
      creditLimitValue: 'Limite de Crédito',
      discontValue: 'Valor do Desconto',
      status: 'Status'
    }

    return {
      show,
      open,
      error,
      loading,
      mapLabel,
      customer
    }
  }
})
</script>
