export const appBasePath = '/ynov-cicd/'

/**
 * Builds absolute links that stay inside the Vite deployment base path.
 */
export function appHref(path = '') {
  const normalizedBasePath = appBasePath.endsWith('/')
    ? appBasePath
    : `${appBasePath}/`

  return `${normalizedBasePath}${path.replace(/^\/+/, '')}`
}
