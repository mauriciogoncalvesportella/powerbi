<template>
  <q-page
    class="q-pb-lg q-pt-lg"
  >
    <responsive-header />
    <q-inner-loading
      v-if="loading"
      :showing="true"
      class="full-width full-height"
    >
      <q-spinner-cube
        size="100px"
        color="primary"
        label="Aguarde um momento..."
      />
    </q-inner-loading>

    <div
      class="row justify-center q-col-gutter-sm"
    >
      <div
        class="col-12 col-md-8 col-lg-6"
      >
        <q-checkbox
          v-model="onlyActives"
          label="Somente ativos"
        />
        <q-input
          square
          outlined
          class="q-mb-md"
          v-model="search"
          label="Procurar por palavra chave"
        >
          <template v-slot:prepend>
            <q-icon name="person_search" />
          </template>
        </q-input>
        <q-list
          bordered
          separator
        >
          <q-item
            v-for="(user) in filteredUsers"
            :key="user.id"
            class="item-hover"
          >
            <q-item-section avatar>
              <q-icon
                :color="user.active ? 'primary' : 'red'"
                :name="getRoleIcon(user.role)"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label>
                <q-chip
                  dense
                  icon="group"
                  class="q-px-sm"
                >
                  {{ user.teamName }}
                </q-chip>
              </q-item-label>
              <q-item-label caption lines="1">login: {{ credential.idEmpresa }}/{{ user.loginId ?? user.code }}</q-item-label>
              <q-item-label caption lines="1">{{ user.email }}</q-item-label>
              <q-item-label>{{ user.name }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <div
                class="row"
              >
                <q-btn
                  push
                  round
                  dense
                  :loading="loadingId === user.code"
                  :disable="user.role === 3 && user.code !== credential.cdVendedor"
                  icon="assignment_ind"
                  class="q-mx-xs"
                  @click="userCode = user.code; promptIdInput = user.loginId ?? ''; promptId = true"
                >
                  <q-tooltip> Alterar login </q-tooltip>
                </q-btn>
                <q-btn
                  push
                  round
                  dense
                  :disable="user.role === 3 && user.code !== credential.cdVendedor"
                  icon="vpn_key"
                  class="q-mx-xs"
                  :color="user.passwordCreated ? 'green' : 'grey'"
                  @click="userCode = user.code; promptPassword = true"
                >
                  <q-tooltip> Alterar senha </q-tooltip>
                </q-btn>
                <q-btn
                  push
                  round
                  class="q-mx-xs"
                  dense
                  :loading="loadingActiveOrDeactive === user.code"
                  :disable="user.role === 3"
                  :color="user.active ? 'green' : 'grey'"
                  icon="power_settings_new"
                  @click="activeOrDeactive(user.code)"
                >
                  <q-tooltip> {{ user.active ? 'Desativar usuário' : 'Ativar usuário' }} </q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

    <q-dialog v-model="promptPassword" persistent>
      <q-card style="min-width: 350px">
        <q-card-section
          class="q-pb-none q-pt-md"
        >
          <q-icon
            name="person"
            size="sm"
          />
          {{ selectedUser.name }}
        </q-card-section>
        <q-card-section
          class="q-py-none"
        >
          <div class="text-h6">Alterar senha</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="promptPasswordInput"
            label="Nova senha"
            :error="promptPasswordInputError"
            error-message="A senha deve ter no mínimo 5 carateceres"
            hint="A senha deve ter no mínimo 5 carateceres"
            dense
            autofocus
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Fechar" v-close-popup />
          <q-btn
            flat
            label="Salvar"
            :loading="loadingPassword"
            @click="changePassword"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="promptId" persistent>
      <q-card style="min-width: 350px">
        <q-card-section
          class="q-pb-none q-pt-md"
        >
          <q-icon
            name="person"
            size="sm"
          />
          {{ selectedUser.name }}
        </q-card-section>
        <q-card-section
          class="q-py-none"
        >
          <div
            class="row justify-space-between"
          >
            <div class="text-h6">Alterar login</div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="promptIdInput"
            label="Novo login"
            :error="promptIdInputError != ''"
            :error-message="promptIdInputError"
            hint="Apenas letra minúscula, número e underline _ é permitido"
            dense
            autofocus
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            flat
            label="Salvar"
            :loading="loadingId"
            @click="changeId"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { Notify } from 'quasar'
import { apiProvider } from 'src/boot/axios'
import { useAuth } from 'src/reactive/UseAuth'
import { defineComponent, ref, Ref, onMounted, computed, watch } from 'vue'
import { customAlphabet } from 'nanoid'
import ResponsiveHeader from 'src/components/core/ResponsiveHeader.vue'

export default defineComponent({
  components: { ResponsiveHeader },
  setup () {
    const loading = ref(false)
    const users: Ref<any[]> = ref([])
    const error = ref(false)
    const onlyActives = ref(false)
    const search = ref('')
    const loadingActiveOrDeactive = ref(-1)
    const loadingPassword = ref(false)
    const loadingId = ref(false)
    const promptPassword = ref(false)
    const promptId = ref(false)
    const promptPasswordInput = ref('')
    const promptPasswordInputError = ref(false)
    const promptIdInput = ref('')
    const promptIdInputError = ref('')
    const userCode = ref(-1)

    watch(promptPasswordInput, value => {
      if (value.length > 0) {
        promptPasswordInputError.value = false
      }
    })

    watch(promptIdInput, value => {
      if (value.length > 0) {
        promptIdInputError.value = ''
      }
    })

    watch(promptPassword, value => {
      if (value) {
        const nanoid = customAlphabet('123abcde@')
        promptPasswordInput.value = nanoid(8)
      }
    })

    const getRoleIcon = (role: number) => {
      if (role === 3) {
        return 'admin_panel_settings'
      }
      if (role === 4) {
        return 'supervisor_account'
      }
      return 'person'
    }

    const getData = async () => {
      loading.value = true
      error.value = true
      try {
        users.value = (await apiProvider.axios.get('user-status/all')).data
      } catch (err) {
        error.value = true
      } finally {
        loading.value = false
      }
    }

    const activeOrDeactive = async (userCode: number) => {
      try {
        const user = users.value.find(user => user.code === userCode)
        if (!user) {
          throw new Error()
        }

        loadingActiveOrDeactive.value = userCode
        await apiProvider.axios.post(
          'user-status/active-or-deactive',
          null,
          {
            params: {
              code: user.code,
              status: !user.active
            }
          }
        )
        user.active = !user.active
        Notify.create({
          message: `Vendedor ${user.name} foi ${user.active ? 'ativado' : 'desativado'} com sucesso`,
          color: 'green'
        })
      } catch (err) {
        Notify.create('Erro ao tentar ativar/desativar')
      } finally {
        loadingActiveOrDeactive.value = -1
      }
    }

    const changePassword = async () => {
      if (promptPasswordInput.value.length < 5) {
        promptPasswordInputError.value = true
        return
      }

      try {
        loadingPassword.value = true
        await apiProvider.axios.post(
          'user-status/change-password',
          {
            userCode: userCode.value,
            password: promptPasswordInput.value
          }
        )
        const user = users.value.find(user => user.code === userCode.value)
        if (user) {
          user.passwordCreated = true
        }
        Notify.create({ color: 'green', message: 'Senha alterada com sucesso' })
      } catch (err) {
        Notify.create({ color: 'red', message: 'Erro ao trocar a senha' })
      } finally {
        loadingPassword.value = false
      }
    }

    const changeId = async () => {
      if (!/^[a-z0-9_]+$/.test(promptIdInput.value)) {
        promptIdInputError.value = 'É permitido apenas: letras minúsculas, números e underline'
        return
      }

      try {
        loadingId.value = true
        await apiProvider.axios.post(
          'user-status/change-user-id',
          {
            userCode: userCode.value,
            loginId: promptIdInput.value
          }
        )
        const user = users.value.find(user => user.code === userCode.value)
        if (user) {
          user.loginId = promptIdInput.value
        }
        Notify.create({ color: 'green', message: 'Login alterado com sucessso' })
        promptId.value = false
      } catch (err: any) {
        if (err.response.status === 409) {
          Notify.create({ color: 'red', message: 'Login já utilizado' })
        } else {
          Notify.create({ color: 'red', message: 'Erro ao tentar trocar a senha' })
        }
      } finally {
        loadingId.value = false
      }
    }

    onMounted(() => getData())
    const filteredUsers = computed(() => {
      return users.value.filter(user => {
        if (onlyActives.value && !user.active) {
          return false
        }
        if (search.value) {
          const name = user.name.toLowerCase()
          const email = user.email.toLowerCase()
          const team = user.teamName.toLowerCase()
          const searchText = search.value.toLowerCase()
          return name.includes(searchText) ||
            email.includes(searchText) ||
            team.includes(searchText)
        }
        return true
      })
    })

    const selectedUser = computed(() => {
      const user = users.value.find(user => user.code === userCode.value)
      return user ?? {}
    })

    return {
      selectedUser,
      userCode,
      promptPasswordInputError,
      promptIdInputError,
      loadingPassword,
      loadingId,
      promptPassword,
      promptId,
      promptPasswordInput,
      promptIdInput,
      changePassword,
      changeId,
      loadingActiveOrDeactive,
      activeOrDeactive,
      filteredUsers,
      onlyActives,
      getRoleIcon,
      search,
      loading,
      credential: useAuth().user,
      users
    }
  }
})
</script>

<style lang="sass" scoped>
.item-hover
  background-color:(var(--q-color-primary))
  &:hover
    background-color:(var(--q-color-accent))
</style>
