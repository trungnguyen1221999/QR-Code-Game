import { X, Download } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

const STEPS = [
  { emoji: '📝', titleKey: 'hostGuideStep1Title', descKey: 'hostGuideStep1Desc' },
  { emoji: '🎮', titleKey: 'hostGuideStep2Title', descKey: 'hostGuideStep2Desc' },
  { emoji: '⬇️', titleKey: 'hostGuideStep3Title', descKey: 'hostGuideStep3Desc' },
  { emoji: '📍', titleKey: 'hostGuideStep4Title', descKey: 'hostGuideStep4Desc' },
  { emoji: '📤', titleKey: 'hostGuideStep5Title', descKey: 'hostGuideStep5Desc' },
  { emoji: '🚀', titleKey: 'hostGuideStep6Title', descKey: 'hostGuideStep6Desc' },
];

function buildDetailedHTML(t, lang) {
  const isFI = lang === 'FI';
  return `<!DOCTYPE html>
<html lang="${isFI ? 'fi' : 'en'}">
<head>
  <meta charset="UTF-8" />
  <title>${t.hostGuideTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 40px; max-width: 720px; margin: 0 auto; }
    h1 { font-size: 26px; color: #d97706; margin-bottom: 4px; }
    .subtitle { font-size: 14px; color: #6b7280; margin-bottom: 32px; }
    h2 { font-size: 16px; color: #374151; margin: 28px 0 12px; border-bottom: 2px solid #fde68a; padding-bottom: 6px; }
    .step { display: flex; gap: 14px; margin-bottom: 18px; padding: 14px 16px; border-radius: 10px; background: #fffbeb; border: 1px solid #fde68a; }
    .step-num { font-size: 22px; line-height: 1; flex-shrink: 0; }
    .step-title { font-size: 14px; font-weight: 700; color: #92400e; margin-bottom: 4px; }
    .step-desc { font-size: 13px; color: #4b5563; line-height: 1.6; }
    .physical { background: #f0fdf4; border-color: #bbf7d0; }
    .physical .step-title { color: #166534; }
    .tip { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px 16px; margin-top: 28px; }
    .tip-title { font-size: 13px; font-weight: 700; color: #1d4ed8; margin-bottom: 6px; }
    .tip-text { font-size: 13px; color: #374151; line-height: 1.6; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>${t.hostGuideTitle}</h1>

  <h2>${isFI ? '⚙️ Osa 1: Sovelluksen käyttö' : '⚙️ Part 1: Using the App'}</h2>

  <div class="step"><div class="step-num">📝</div><div><div class="step-title">1. ${t.hostGuideStep1Title}</div><div class="step-desc">${t.hostGuideStep1Desc}</div></div></div>
  <div class="step"><div class="step-num">🎮</div><div><div class="step-title">2. ${t.hostGuideStep2Title}</div><div class="step-desc">${t.hostGuideStep2Desc}</div></div></div>
  <div class="step"><div class="step-num">⬇️</div><div><div class="step-title">3. ${t.hostGuideStep3Title}</div><div class="step-desc">${t.hostGuideStep3Desc}</div></div></div>
  <div class="step"><div class="step-num">📤</div><div><div class="step-title">4. ${t.hostGuideStep5Title}</div><div class="step-desc">${t.hostGuideStep5Desc}</div></div></div>
  <div class="step"><div class="step-num">🚀</div><div><div class="step-title">5. ${t.hostGuideStep6Title}</div><div class="step-desc">${t.hostGuideStep6Desc}</div></div></div>

  <h2>${isFI ? '📍 Osa 2: Fyysinen asennus' : '📍 Part 2: Physical Setup'}</h2>

  <div class="step physical"><div class="step-num">🖨️</div><div>
    <div class="step-title">${isFI ? 'Tulosta QR-koodit' : 'Print the QR Codes'}</div>
    <div class="step-desc">${isFI ? 'Lataa kaikki QR-koodit sovelluksesta. Tulosta jokainen koodi A4- tai A5-paperille. Suosittelemme laminointia sään kestävyyden vuoksi ulkokäytössä.' : 'Download all QR codes from the app. Print each code on A4 or A5 paper. We recommend laminating them for weather resistance if used outdoors.'}</div>
  </div></div>

  <div class="step physical"><div class="step-num">🗺️</div><div>
    <div class="step-title">${isFI ? 'Valitse fyysiset sijainnit' : 'Choose Physical Locations'}</div>
    <div class="step-desc">${isFI ? 'Valitse selkeästi erottuvia paikkoja alueella — esim. puu, penkki, opaste tai rakennus. Varmista, että paikat ovat turvallisia ja kaikkien osallistujien saavutettavissa.' : 'Choose clearly distinct spots around the area — e.g. a tree, bench, sign, or building. Make sure locations are safe and reachable by all participants.'}</div>
  </div></div>

  <div class="step physical"><div class="step-num">📌</div><div>
    <div class="step-title">${isFI ? 'Kiinnitä QR-koodit' : 'Attach the QR Codes'}</div>
    <div class="step-desc">${isFI ? 'Kiinnitä jokainen QR-koodi vastaavaan tarkistuspisteeseen käyttäen teippiä tai tarroja. Sijoita ne silmien korkeudelle ja varmista, että ne ovat helposti skannattavissa puhelimella.' : 'Stick each QR code at the corresponding checkpoint using tape or adhesive. Place them at eye level and make sure they are easily scannable with a phone camera.'}</div>
  </div></div>

  <div class="step physical"><div class="step-num">🗺️</div><div>
    <div class="step-title">${isFI ? 'Jaa kartta pelaajille' : 'Hand Out the Map to Players'}</div>
    <div class="step-desc">${isFI ? 'Anna jokaiselle pelaajalle tai ryhmälle kartta, johon on merkitty tarkistuspisteiden sijainnit. Pelaajat käyttävät tätä navigoidakseen alueella.' : 'Give each player or team a printed map showing where the checkpoints are located. Players use this to navigate around the venue.'}</div>
  </div></div>

</body>
</html>`;
}

export default function HostGuideModal({ onClose }) {
  const { t, language } = useLanguage();

  const handleDownloadDetail = () => {
    const html = buildDetailedHTML(t, language);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-2xl flex flex-col"
        style={{ backgroundColor: 'var(--color-bg)', maxHeight: '85vh', maxWidth: 480 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ borderBottom: '1px solid var(--color-info-bg)' }}>
          <p className="font-bold text-base" style={{ color: 'var(--color-text)' }}>
            📖 {t.hostGuideTitle}
          </p>
          <button onClick={onClose} className="p-1 rounded-full" style={{ backgroundColor: 'var(--color-info-bg)' }}>
            <X size={16} style={{ color: 'var(--color-subtext)' }} />
          </button>
        </div>

        {/* Scrollable steps */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-subtext)' }}>
            {t.hostGuideQuickTitle}
          </p>
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={{ backgroundColor: 'var(--color-info-bg)' }}>
              <span className="text-lg leading-none shrink-0 mt-0.5">{step.emoji}</span>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                  {i + 1}. {t[step.titleKey]}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-subtext)', lineHeight: 1.6 }}>
                  {t[step.descKey]}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Download detailed guide */}
        <div className="px-5 pb-6 pt-3" style={{ borderTop: '1px solid var(--color-info-bg)' }}>
          <button
            onClick={handleDownloadDetail}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold"
            style={{ backgroundColor: '#1D4ED8', color: 'white' }}
          >
            <Download size={15} />
            {t.hostGuideDetailBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
