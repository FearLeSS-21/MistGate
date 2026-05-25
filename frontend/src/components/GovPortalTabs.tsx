import { useState } from 'react';
import { Building, ExternalLink } from 'lucide-react';

type Lang = 'en' | 'ar';

interface LocalizedText {
  en: string;
  ar: string;
}

interface GovPortal {
  id: string;
  url: string;
  title: LocalizedText;
  description: LocalizedText;
  cta: LocalizedText;
}

const GOV_PORTALS: GovPortal[] = [
  {
    id: 'misrgate',
    url: 'https://digital.gov.eg',
    title: { en: 'MisrGate Hub', ar: 'مركز بوابة مصر' },
    description: {
      en: 'Integrated document services and live application tracking in one portal.',
      ar: 'خدمات الوثائق الموحدة وتتبع المعاملات المباشر في بوابة واحدة.',
    },
    cta: { en: 'Open hub', ar: 'فتح المركز' },
  },
  {
    id: 'digital-egypt',
    url: 'https://digital.gov.eg',
    title: { en: 'Digital Egypt Portal', ar: 'بوابة مصر الرقمية' },
    description: {
      en: 'Unified national platform for ministry and governorate e-services.',
      ar: 'المنصة الوطنية الموحدة لخدمات الوزارات والمحافظات الإلكترونية.',
    },
    cta: { en: 'Open portal', ar: 'فتح البوابة' },
  },
  {
    id: 'interior',
    url: 'https://moi.gov.eg',
    title: { en: 'Ministry of Interior', ar: 'وزارة الداخلية' },
    description: {
      en: 'Civil registry, traffic licensing, and residency citizen services.',
      ar: 'الأحوال المدنية، وخدمات المرور، وتصاريح الإقامة للمواطنين.',
    },
    cta: { en: 'Open portal', ar: 'فتح البوابة' },
  },
  {
    id: 'recruitment',
    url: 'https://tagned.mod.gov.eg',
    title: { en: 'Recruitment Department', ar: 'إدارة التجنيد والتعبئة' },
    description: {
      en: 'Military status records, postponement, and travel permit services.',
      ar: 'معاملات التجنيد، التأجيل، وتصاريح السفر العسكرية.',
    },
    cta: { en: 'Open portal', ar: 'فتح البوابة' },
  },
];

interface GovPortalTabsProps {
  lang: Lang;
  isRtl: boolean;
}

export function GovPortalTabs({ lang, isRtl }: GovPortalTabsProps) {
  const [activeId, setActiveId] = useState(GOV_PORTALS[0].id);
  const L = (text: LocalizedText) => (lang === 'en' ? text.en : text.ar);

  return (
    <div className="gov-portal-section" dir={isRtl ? 'rtl' : 'ltr'}>
      <div
        className="gov-portals-grid"
        role="tablist"
        aria-label={L({ en: 'Government portals', ar: 'البوابات الحكومية' })}
      >
        {GOV_PORTALS.map((portal) => {
          const isActive = portal.id === activeId;
          return (
            <div
              key={portal.id}
              role="tab"
              aria-selected={isActive}
              className={`glass-card gov-portal-card ${isActive ? 'gov-portal-card--active' : ''}`}
              style={{ textAlign: isRtl ? 'right' : 'left' }}
              onClick={() => setActiveId(portal.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveId(portal.id);
                }
              }}
              tabIndex={0}
            >
              <div
                className="gov-portal-icon"
                style={{ alignSelf: isRtl ? 'flex-end' : 'flex-start' }}
              >
                <Building size={16} aria-hidden />
              </div>
              <h3>{L(portal.title)}</h3>
              <p>{L(portal.description)}</p>
              <a
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline gov-portal-btn"
                onClick={(e) => e.stopPropagation()}
              >
                {L(portal.cta)}
                <ExternalLink size={12} aria-hidden />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
