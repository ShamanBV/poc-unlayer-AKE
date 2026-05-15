// Fruzaqla brand — copied from apryse-designer/data/bds/qa/shaman-onco-us/6.json
// This is the canonical Brand Design System (BDS) shape used by the Shaman platform.

export interface BrandColor {
  hex: string;
  role: 'primary' | 'secondary' | 'tertiary';
  name: string;
  lightPercent?: number;
}

export interface BrandHeading {
  fontSize: string;
  fontWeight: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: string;
  description?: string;
}

export interface BrandBody {
  textColor: string;
  backgroundColor: string;
  emailBackgroundColor: string;
  contentWidth: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  textAlign: 'left' | 'center' | 'right';
  linkColor: string;
  linkHoverColor: string;
  fontFamily: string;
}

export interface BrandButton {
  backgroundColor: string;
  hoverBackgroundColor: string;
  color: string;
  hoverColor: string;
  borderRadius: string;
  fontSize: string;
  fontWeight: number;
  padding: string;
  description?: string;
  border?: {
    borderWidth: string;
    borderStyle: string;
    borderColor: string;
  };
}

export interface BrandDefinition {
  colors: BrandColor[];
  headings: Record<'h1' | 'h2' | 'h3' | 'h4' | 'h5', BrandHeading>;
  body: BrandBody;
  buttons: {
    primary: BrandButton;
    secondary: BrandButton;
    text: BrandButton;
  };
  divider: {
    borderTopColor: string;
    borderTopStyle: string;
    borderTopWidth: string;
  };
  emailComponents: {
    emailBackgroundColor: string;
    timerColor: string;
    qrCodeColor: string;
  };
  references: {
    color: string;
    fontSize: string;
    fontWeight: number;
  };
}

export const FRUZAQLA: BrandDefinition = {
  colors: [
    { hex: '#8C4799', role: 'primary', lightPercent: 10, name: 'Purple' },
    { hex: '#002855', role: 'secondary', lightPercent: 20, name: 'Navy' },
    { hex: '#59CBE8', role: 'tertiary', name: 'Sky' },
    { hex: '#97D700', role: 'tertiary', name: 'Sheen Green' },
    { hex: '#FFC72C', role: 'tertiary', name: 'Sunglow' },
  ],
  headings: {
    h1: { fontSize: '30px', fontWeight: 700, color: '#002855', textAlign: 'center', lineHeight: '120%', description: 'Hero' },
    h2: { fontSize: '24px', fontWeight: 700, color: '#8C4799', textAlign: 'center', lineHeight: '120%', description: 'Section' },
    h3: { fontSize: '20px', fontWeight: 700, color: '#002855', textAlign: 'left', lineHeight: '130%', description: 'Sub' },
    h4: { fontSize: '16px', fontWeight: 400, color: '#002855', textAlign: 'left', lineHeight: '140%', description: 'Card' },
    h5: { fontSize: '14px', fontWeight: 400, color: '#8C4799', textAlign: 'left', lineHeight: '140%', description: 'Label' },
  },
  body: {
    textColor: '#002855',
    backgroundColor: '#F7F8F9',
    emailBackgroundColor: '#F7F8F9',
    contentWidth: '600px',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '140%',
    textAlign: 'left',
    linkColor: '#8C4799',
    linkHoverColor: '#6B3575',
    fontFamily: 'arial,helvetica,sans-serif',
  },
  buttons: {
    primary: {
      backgroundColor: '#8C4799',
      hoverBackgroundColor: '#6B3575',
      color: '#FFFFFF',
      hoverColor: '#FFFFFF',
      borderRadius: '8px',
      fontSize: '15px',
      fontWeight: 700,
      padding: '13px 50px',
      description: 'Primary',
    },
    secondary: {
      backgroundColor: '#FFFFFF',
      hoverBackgroundColor: '#6B3575',
      color: '#8C4799',
      hoverColor: '#FFFFFF',
      borderRadius: '8px',
      fontSize: '15px',
      fontWeight: 700,
      padding: '11px 48px',
      description: 'Secondary',
      border: { borderWidth: '2px', borderStyle: 'solid', borderColor: '#8C4799' },
    },
    text: {
      backgroundColor: 'transparent',
      hoverBackgroundColor: 'transparent',
      color: '#8C4799',
      hoverColor: '#009461',
      borderRadius: '0px',
      fontSize: '15px',
      fontWeight: 700,
      padding: '13px 50px',
      description: 'Text button →',
    },
  },
  divider: {
    borderTopColor: '#59CBE8',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
  },
  emailComponents: {
    emailBackgroundColor: '#F7F8F9',
    timerColor: '#8C4799',
    qrCodeColor: '#8C4799',
  },
  references: {
    color: '#002855',
    fontSize: '12px',
    fontWeight: 400,
  },
};
