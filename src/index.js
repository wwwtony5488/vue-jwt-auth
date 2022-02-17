import Vue from 'vue'
import axios from 'axios'
import jwtDecode from "jwt-decode";

let instance
let refresher

export const getInstance = () => instance

export const useJwtAuth = (options) => {
  if (instance) return instance

  const {
    accessKey = 'accessToken',
    loginApiUrl = '/api/login/',
    refreshKey = 'refreshToken',
    refreshApiUrl = '/api/refresh/',
    logoutUrl = '/login',
    tokenType = 'Bearer',
    isUseRefresh = false,
    refreshInterval = 30000,
  } = options

  instance = new Vue({
    data() {
      return {
        isLoading: true,
        isAuthenticated: false,
      }
    },
    async created() {
      try {
        if (isUseRefresh) {
          if (localStorage.getItem(refreshKey)) {
            await this.refresh()
            refresher = setTimeout(this.refresh, refreshInterval)
          }
        }

        const accessToken = localStorage.getItem(accessKey)

        if (accessToken) {
          const { exp } = jwtDecode(accessToken)
          const current = new Date().getTime() / 1000

          if (current > exp) {
            this.handleSetAuthorization(`${tokenType} ${accessToken}`)
            this.isAuthenticated = true
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    methods: {
      setAuthorization(token) {
        axios.defaults.headers.common['Authorization'] = token
      },
      setTokenStorage(data) {
        localStorage.setItem(accessKey, data[accessKey])
        localStorage.setItem(refreshKey, data[refreshKey])
      },
      getLogoutUrl() {
        return logoutUrl
      },
      async login(payload) {
        const { data } = await axios.post(loginApiUrl, payload)
        this.setTokenStorage(data)
        this.isAuthenticated = true
      },
      async refresh() {
        const refreshToken = localStorage.getItem(refreshKey)
        const payload = { [refreshKey]: refreshToken }
        const { data } = await axios.post(refreshApiUrl, payload)
        this.setTokenStorage(data)
        this.isAuthenticated = true
      },
      logout() {
        clearTimeout(refresher)
        localStorage.removeItem(accessKey)
        localStorage.removeItem(refreshKey)
        this.isAuthenticated = false
      },
    },
  })

  return instance
}

export const jwtAuthPlugin = {
  install(Vue, options) {
    Vue.prototype.$auth = useJwtAuth(options)
  },
}
