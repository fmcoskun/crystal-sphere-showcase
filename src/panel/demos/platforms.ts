export type PlatformId = 'linux' | 'macos' | 'docker' | 'api'

// Fictional product: every address uses the reserved .example TLD.
export const PLATFORM_COMMANDS: Record<PlatformId, { cmd: string }> = {
  linux: { cmd: 'curl -fsSL https://get.crystalcore.example/install.sh | sudo bash' },
  macos: { cmd: 'brew install crystalcore --source https://get.crystalcore.example && crystal init' },
  docker: { cmd: 'docker run -d --name crystal-core -p 8080:8080 registry.crystalcore.example/core:v2.4' },
  api: { cmd: 'curl -H "Authorization: Bearer crs_test_example" https://api.crystalcore.example/v2/pulse' },
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // fall through to the legacy path
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}
