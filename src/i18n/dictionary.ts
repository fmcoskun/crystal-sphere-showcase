export type Lang = 'tr' | 'en'

const en = {
  'trigger.open': 'Open the system modules',
  'trigger.label': 'Start the system',
  'panel.title': 'System modules',
  'panel.subtitle': 'Tap a module to try it live',
  'panel.close': 'Close',
  'panel.back': 'Modules',
  'module.automation.name': 'Smart Automation',
  'module.automation.desc': 'AI-driven autonomous task and workflow engine',
  'module.automation.badge': '99.4% efficiency',
  'module.security.name': 'Security & Infrastructure',
  'module.security.desc': 'Zero-trust encryption and cryptographic integrity',
  'module.security.badge': 'Zero-Trust',
  'module.performance.name': 'Live Performance',
  'module.performance.desc': 'Real-time telemetry and query accelerator',
  'module.performance.badge': '0.4 ms latency',
  'module.platforms.name': 'Platforms & API',
  'module.platforms.desc': 'Linux, macOS, Docker and CLI in one step',
  'module.platforms.badge': 'One-step install',
  'ui.lang': 'Switch language',
  'ui.theme': 'Switch theme',
  'ui.studio': 'Studio lighting controls',
  'ui.studio.angle': 'Caustic angle',
  'ui.studio.caustic': 'Floor refraction',
  'ui.studio.glare': 'Window glare',
  'demo.copy': 'Copy command',
  'demo.copied': 'Copied to clipboard',
  'demo.copyFailed': 'Could not copy',
} as const

export type DictKey = keyof typeof en

const tr: Record<DictKey, string> = {
  'trigger.open': 'Sistem modüllerini aç',
  'trigger.label': 'Sistemi başlat',
  'panel.title': 'Sistem modülleri',
  'panel.subtitle': 'Canlı denemek için bir modüle dokun',
  'panel.close': 'Kapat',
  'panel.back': 'Modüller',
  'module.automation.name': 'Akıllı Otomasyon',
  'module.automation.desc': 'AI destekli otonom görev ve iş akışı motoru',
  'module.automation.badge': '%99,4 verim',
  'module.security.name': 'Güvenlik & Altyapı',
  'module.security.desc': 'Zero-Trust şifreleme ve kriptografik bütünlük',
  'module.security.badge': 'Zero-Trust',
  'module.performance.name': 'Canlı Performans',
  'module.performance.desc': 'Gerçek zamanlı telemetri ve sorgu hızlandırıcı',
  'module.performance.badge': '0,4 ms gecikme',
  'module.platforms.name': 'Platformlar & API',
  'module.platforms.desc': 'Linux, macOS, Docker ve CLI tek adımda',
  'module.platforms.badge': 'Tek adım kurulum',
  'ui.lang': 'Dili değiştir',
  'ui.theme': 'Temayı değiştir',
  'ui.studio': 'Stüdyo ışık kontrolleri',
  'ui.studio.angle': 'Kostik ışık açısı',
  'ui.studio.caustic': 'Zemin kırılması',
  'ui.studio.glare': 'Pencere yansıması',
  'demo.copy': 'Komutu kopyala',
  'demo.copied': 'Panoya kopyalandı',
  'demo.copyFailed': 'Kopyalanamadı',
}

const dictionary: Record<Lang, Record<DictKey, string>> = { tr, en }

export function t(lang: Lang, key: DictKey): string {
  return dictionary[lang][key]
}
