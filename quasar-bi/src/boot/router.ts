import { boot } from 'quasar/wrappers'
import router from 'src/router'

export default boot(({ app }) => {
  app.use(router)
})
