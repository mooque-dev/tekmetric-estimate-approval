import { useEffect, useRef, useState, type ComponentType } from 'react'
import Gallery from './components/Gallery'
import MetaSwitcher from './components/MetaSwitcher'
import { focusEl } from './lib/a11y'
import { getVariant, type VariantId } from './variants/registry'
import CartApp from './variants/CartApp'
import EditorialApp from './variants/EditorialApp'
import WizardApp from './variants/WizardApp'

/** Read the current variant from the URL hash (e.g. #guided). */
function useHashRoute(): { route: VariantId | null; navigated: boolean } {
  const parse = () => {
    const id = window.location.hash.replace(/^#/, '')
    return getVariant(id)?.id ?? null
  }
  const [route, setRoute] = useState<VariantId | null>(parse)
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

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      {route ? (
        <>
          <MetaSwitcher active={route} />
          {(() => {
            const VariantApp = VARIANT_APPS[route]
            return <VariantApp />
          })()}
        </>
      ) : (
        <Gallery />
      )}
    </>
  )
}
