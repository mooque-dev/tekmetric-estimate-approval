import { useEffect, useState, type ComponentType } from 'react'
import Gallery from './components/Gallery'
import MetaSwitcher from './components/MetaSwitcher'
import { getVariant, type VariantId } from './variants/registry'
import CartApp from './variants/CartApp'
import EditorialApp from './variants/EditorialApp'
import WizardApp from './variants/WizardApp'

/** Read the current variant from the URL hash (e.g. #guided). */
function useHashRoute(): VariantId | null {
  const parse = () => {
    const id = window.location.hash.replace(/^#/, '')
    return getVariant(id)?.id ?? null
  }
  const [route, setRoute] = useState<VariantId | null>(parse)
  useEffect(() => {
    const onChange = () => {
      setRoute(parse())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

const VARIANT_APPS: Record<VariantId, ComponentType> = {
  editorial: EditorialApp,
  guided: WizardApp,
  cart: CartApp,
}

export default function App() {
  const route = useHashRoute()

  if (!route) return <Gallery />

  const VariantApp = VARIANT_APPS[route]
  return (
    <>
      <MetaSwitcher active={route} />
      <VariantApp />
    </>
  )
}
