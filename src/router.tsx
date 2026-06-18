import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { appBasePath } from './lib/app-href'
import { routeTree } from './routeTree.gen'

/**
 * Creates the TanStack Router instance used by the application.
 */
export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    basepath: appBasePath,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
