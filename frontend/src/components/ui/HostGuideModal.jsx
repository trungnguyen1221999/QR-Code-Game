import { X, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useLanguage } from '../../context/LanguageContext.jsx';

const STEPS = [
  { emoji: '📝', titleKey: 'hostGuideStep1Title', descKey: 'hostGuideStep1Desc' },
  { emoji: '🎮', titleKey: 'hostGuideStep2Title', descKey: 'hostGuideStep2Desc' },
  { emoji: '⬇️', titleKey: 'hostGuideStep3Title', descKey: 'hostGuideStep3Desc' },
  { emoji: '📍', titleKey: 'hostGuideStep4Title', descKey: 'hostGuideStep4Desc' },
  { emoji: '📤', titleKey: 'hostGuideStep5Title', descKey: 'hostGuideStep5Desc' },
  { emoji: '🚀', titleKey: 'hostGuideStep6Title', descKey: 'hostGuideStep6Desc' },
];


export default function HostGuideModal({ onClose }) {
  const { t, language } = useLanguage();

  const handleDownloadDetail = () => {
    const isFI = language === 'FI';
    const steps = isFI ? [
      ['Pelin asetukset', 'Anna pelille nimi, aseta kesto (15-120 min), valitse vaikeustaso ja skannausmuoto.'],
      ['Valitse pelit', 'Valitse haluamasi pelit 13 saatavilla olevasta minipelista - sinun ei tarvitse valita kaikkia. Veda pelejä järjestykseen.'],
      ['Skannausmuoto', 'Järjestetty: pelaajien on skannattava pisteet järjestyksessa (1->2->3->...). Satunnainen: pelaajat voivat skannata missä tahansa järjestyksessa.'],
      ['Vaikeustaso', 'Helppo: rajattomat elamat. Normaali: 5 elamaa. Vaikea: 3 elamaa. Jos elamat loppuvat, pelaaja aloittaa alusta pisteesta 1.'],
      ['Lataa QR-koodit', 'Lataa kaikki QR-koodit kerralla tai yksi kerrallaan. Tulosta ne ja kiinnita ne fyysisiin paikkoihin tarkistuspisteiksi.'],
      ['Jaa kartta ja koodi', 'Anna pelaajille kartta, jossa näkyy tarkistuspisteiden sijainnit. Jaa 6-numeroinen pelikoodi pelaajille.'],
      ['Aloita ja seuraa', 'Siirry kojelautaan ja paina Aloita. Seuraa reaaliajassa missä pisteessä kukin pelaaja on ja heidän sijoitustaan.'],
    ] : [
      ['Game Settings', 'Enter a game name, set the duration (15-120 min), choose a difficulty level and scan mode.'],
      ['Select Games', 'Choose any number of games from the 13 available — you do not have to use all of them. Drag to reorder.'],
      ['Scan Mode', 'Ordered: players must scan checkpoints in sequence (1->2->3->...). Random: players can scan in any order.'],
      ['Difficulty', 'Easy: unlimited lives. Normal: 5 lives. Hard: 3 lives. If all lives are lost, the player restarts from checkpoint 1.'],
      ['Download QR Codes', 'Download all QR codes at once or one by one. Print and place them at physical checkpoint locations.'],
      ['Share Map & Code', 'Give players a map showing checkpoint locations. Share the 6-digit game code so players can join.'],
      ['Start & Monitor', 'Go to the dashboard and press Start. Track in real time which checkpoint each player is at and their ranking.'],
    ];

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 18;
    const contentW = pageW - margin * 2;
    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(217, 119, 6);
    doc.text(t.hostGuideTitle, margin, y);
    y += 12;

    steps.forEach(([title, desc], i) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text(`${i + 1}.  ${title}`, margin, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      const lines = doc.splitTextToSize(desc, contentW - 6);
      doc.text(lines, margin + 6, y);
      y += lines.length * 5 + 5;
    });

    doc.save(`${t.hostGuideTitle}.pdf`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-2xl flex flex-col"
        style={{ backgroundColor: 'var(--color-bg)', maxHeight: '92vh', maxWidth: 480 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#D1D5DB' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-2 pb-3">
          <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
            📖 {t.hostGuideTitle}
          </p>
          <button onClick={onClose} className="p-1.5 rounded-full" style={{ backgroundColor: 'var(--color-info-bg)' }}>
            <X size={14} style={{ color: 'var(--color-subtext)' }} />
          </button>
        </div>

        {/* Scrollable steps */}
        <div className="flex-1 overflow-y-auto px-4 pb-3 flex flex-col gap-2">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl px-3 py-2.5" style={{ backgroundColor: 'var(--color-info-bg)' }}>
              <div
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                  {step.emoji} {t[step.titleKey]}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-subtext)', lineHeight: 1.55 }}>
                  {t[step.descKey]}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Download button */}
        <div className="px-4 pb-6 pt-2">
          <button
            onClick={handleDownloadDetail}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold"
            style={{ backgroundColor: '#1D4ED8', color: 'white' }}
          >
            <Download size={14} />
            {t.hostGuideDetailBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
