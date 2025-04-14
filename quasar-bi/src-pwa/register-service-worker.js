import { register } from 'register-service-worker'
import { Notify } from 'quasar'

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready (/* registration */) {
  },

  registered (/* registration */) {
  },

  cached (/* registration */) {
  },

  updatefound (/* registration */) {
  },

  updated (/* registration */) {
    Notify.create({
      message: 'Nova atualização',
      icon: 'cloud_download',
      closeBtn: 'atualizar',
      timeout: 10000,
      onDismiss: () => {
        // location.reload(true)
        // https://stackoverflow.com/questions/65990413/javascript-clear-browser-cache-for-end-user
        window.location.reload(true)
      }
    })
  },

  offline () {
  },

  error (err) {
  }
})
