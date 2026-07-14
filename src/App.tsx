import { useEffect, useRef, useState, type ComponentType } from 'react'
import Gallery from './components/Gallery'
import { focusEl } from './lib/a11y'
import { getVariant, type VariantId } from './variants/registry'
import CartApp from './variants/CartApp'
import EditorialApp from './variants/EditorialApp'
import WizardApp from './variants/WizardApp'

type Route = VariantId | 'gallery'

/**
 * Route from the URL hash. The front door (no hash) is the final design —
 * Editorial. The two alternate directions and the exploration gallery remain
 * reachable by explicit hash (#guided, #cart, #gallery) as a record of the
 * exploration, but they are no longer the default entry point.
 */
function useHashRoute(): { route: Route; navigated: boolean } {
  const parse = (): Route => {
    const id = window.location.hash.replace(/^#/, '')
    if (id === 'gallery') return 'gallery'
    return getVariant(id)?.id ?? 'editorial'
  }
  const [route, setRoute] = useState<Route>(parse)
  const navigated = useRef(false)
  useEffect(() => {
    const onChange = () => {
      navigated.current = true
      setRoute(parse())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return { route, navigated: navigated.current }
}

const VARIANT_APPS: Record<VariantId, ComponentType> = {
  editorial: EditorialApp,
  guided: WizardApp,
  cart: CartApp,
}

export default function App() {
  const { route, navigated } = useHashRoute()

  // On a route change (not first load), move focus into the new view so
  // keyboard/screen-reader users land where sighted users do.
  useEffect(() => {
    if (navigated) focusEl(document.getElementById('main'))
  }, [route, navigated])

  const VariantApp = route === 'gallery' ? null : VARIANT_APPS[route]

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      {VariantApp ? <VariantApp /> : <Gallery />}
    </>
  )
}
