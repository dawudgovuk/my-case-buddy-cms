/**
 * Feature flag utilities for My Case Buddy CMS
 */

/**
 * Checks whether the Component Showcase developer page (/components) is enabled.
 * Controlled by VITE_ENABLE_COMPONENT_SHOWCASE (or alias VITE_ENABLE_COMPONENTS_PAGE).
 *
 * Values:
 *   - 'true' or '1' -> enabled
 *   - 'false' or '0' -> disabled
 *   - unset / undefined -> defaults to false in production, true in local dev (import.meta.env.DEV)
 */
export const isComponentShowcaseEnabled = (
  envObj: Record<string, unknown> | undefined = (typeof import.meta !== 'undefined' && import.meta.env)
    ? (import.meta.env as unknown as Record<string, unknown>)
    : undefined
): boolean => {
  const envVal =
    envObj?.VITE_ENABLE_COMPONENT_SHOWCASE ??
    envObj?.VITE_ENABLE_COMPONENTS_PAGE;

  if (envVal !== undefined && envVal !== '') {
    return envVal === 'true' || envVal === '1' || envVal === true;
  }

  return Boolean(envObj?.DEV);
};
