import { getInstance } from '../index'

export const routeGuard = (to, from, next) => {
  const authInstance = getInstance()
  const callback = () => {
    if (authInstance.isAuthenticated) {
      return next()
    }
    next(authInstance.getLogoutUrl())
  }

  if (!authInstance.isLoading) {
    return callback()
  }

  authInstance.$watch('isLoading', (isLoading) => {
    if (!isLoading) {
      return callback()
    }
  })
}
