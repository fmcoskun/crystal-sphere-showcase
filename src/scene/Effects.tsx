import { Bloom, EffectComposer, Noise, SMAA, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import type { JSX } from 'react'
import type { TierSettings } from './quality'

/**
 * Post chain. Bloom only catches the window highlight (threshold 0.9); no vignette, the studio
 * grey stays flat edge to edge. The background is pre-compensated for the Neutral curve (toneMap.ts).
 */
export function Effects({ mode }: { mode: TierSettings['post'] }) {
  if (mode === 'off') return null
  const full = mode === 'full'
  const chain: JSX.Element[] = []
  if (full) chain.push(<Bloom key="bloom" mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.1} intensity={0.45} />)
  chain.push(<ToneMapping key="tone" mode={ToneMappingMode.NEUTRAL} />, <SMAA key="smaa" />)
  if (full) chain.push(<Noise key="grain" premultiply opacity={0.025} />)
  // Remount when the chain changes length; the composer builds its passes once per child set.
  return (
    <EffectComposer key={mode} multisampling={0}>
      {chain}
    </EffectComposer>
  )
}
