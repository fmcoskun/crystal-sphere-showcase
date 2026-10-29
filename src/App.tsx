import { Stage } from './Stage'
import { loadLang } from './i18n/lang'
import { DEFAULT_OPTICS } from './state/optics'

export default function App() {
  return <Stage lang={loadLang()} theme="light" optics={DEFAULT_OPTICS} />
}
