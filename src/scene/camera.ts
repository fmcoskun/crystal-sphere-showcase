import * as THREE from 'three'

export const CAMERA_FOV = 35
export const BASE_DISTANCE = 7
// Keeps the 3-unit sphere within ~78% of the width on portrait screens (fov 35°).
export const PORTRAIT_FIT = 6.1

/** Height of the view at `distance` from the camera. */
export function visibleHeight(distance: number): number {
  return 2 * distance * Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2))
}
