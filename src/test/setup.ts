import '@testing-library/jest-dom/vitest'

// jsdom has no canvas; make getContext return null quietly so WebGL detection reads "unsupported".
HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext
