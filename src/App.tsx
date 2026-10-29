import { Stage } from './Stage'
import { CornerControls } from './ui/CornerControls'
import { useAppState } from './ui/useAppState'

export default function App() {
  const s = useAppState()
  return (
    <>
      <Stage lang={s.lang} theme={s.theme} optics={s.optics} />
      <CornerControls
        lang={s.lang}
        theme={s.theme}
        optics={s.optics}
        onLang={s.setLang}
        onTheme={s.setTheme}
        onOptics={s.setOptics}
      />
    </>
  )
}
