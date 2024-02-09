<template>
  <q-layout
    class="layout-style"
  >
    <q-page-container>
      <q-page
        class="window-height window-width column justify-center"
      >
        <div
          class="row justify-center items-center"
        >
          <q-card
            square
            :bordered="!$q.screen.lt.sm"
            :flat="$q.screen.lt.sm"
            class="col-12 col-sm-7 col-md-4 col-lg-3 shadow-1"
          >
            <q-card-section
              class="row justify-center"
            >
              <q-icon
                name="account_circle"
                size="8rem"
                color="primary"
              />
            </q-card-section>
            <q-form
              @submit="execLogin"
            >
              <q-card-section
                class="q-gutter-md"
              >
                <q-input
                  v-model="email"
                  square
                  filled
                  label="Login"
                  hint="Utilize empresa/código, ex: teste/001"
                  :clearable="$q.screen.lt.sm"
                  :readonly="loading"
                  :error="loginError !== undefined"
                  :error-message="loginError?.message"
                  @keydown="resetError()"
                />
                <q-input
                  v-model="password"
                  square
                  filled
                  :type="isPwd ? 'password' : 'text'"
                  label="Senha"
                  :clearable="$q.screen.lt.sm"
                  :readonly="loading"
                  :error="loginError !== undefined"
                  @keydown="resetError()"
                >
                  <template v-slot:append>
                    <q-icon
                      :name="isPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isPwd = !isPwd"
                    />
                  </template>
                </q-input>
              </q-card-section>
              <q-card-actions
                class="q-px-md q-mb-md"
              >
                <q-btn
                  unelevated
                  rounded
                  color="primary"
                  class="full-width"
                  label="Entrar"
                  type="submit"
                  :loading="loading"
                >
                  <template v-slot:loading>
                    <q-spinner-hourglass class="on-left" />
                    Verificando...
                  </template>
                </q-btn>
              </q-card-actions>
              <!--q-card-section
                class="text-center q-pa-none"
              >
                <p
                  class="text-grey-6"
                >
                  Esqueci minha senha
                </p>
              </q-card-section-->
            </q-form>
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick } from 'vue'
import { useAuth } from 'src/reactive/UseAuth'
import { useRouter, useRoute } from 'vue-router'
import { Notify } from 'quasar'

export default defineComponent({
  // @ts-ignore
  setup () {
    const { session_expired, message, color } = useRoute().query
    if (session_expired === 'true') {
      Notify.create({
        message: 'Sua sessão expirou',
        color: 'red',
        position: 'top'
      })
    }

    if (message) {
      Notify.create({
        message: message as string,
        color: (color as string) ?? 'red',
        position: 'top'
      })
    }

    const isPwd = ref(true)
    const router = useRouter()
    const email = ref('')
    const password = ref('')
    const { login, loading, loginError, resetError } = useAuth()

    const execLogin = async () => {
      await login({ email: email.value, password: password.value })
      if (loginError.value === undefined) {
        nextTick(() => {
          router.push({ name: 'dashboard' })
        })
      }
    }

    return {
      isPwd,
      login,
      email,
      password,
      loading,
      loginError,
      resetError,
      execLogin
    }
  }
})
</script>
<!--script lang="ts">
import { Options, Vue } from 'vue-class-component'

@Options({})
export default class Login extends Vue {
  email = ''
  password = ''
  loginError = false

  get getLoginError () {
    if (this.loginError) {
      return true
    }
    return undefined
  }

  async login () {
    if (!this.$store.state.auth?.loading.login) {
      this.loginError = false

      await this.$store.dispatch('auth/login', {
        email: this.email,
        password: this.password
      })

      if (this.$store.state.auth?.loginError !== undefined) {
        this.loginError = true
      }
    }
  }
}
</script-->

<style lang="sass">
.layout-style
  background: linear-gradient(180deg, $primary 50%, white 50%)
</style>
