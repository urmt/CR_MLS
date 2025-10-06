export interface ReportType {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  icon: string;
  category: 'basic' | 'compliance' | 'premium';
  deliveryTime: string;
  popular?: boolean;
}

export const COSTA_RICA_REPORT_TYPES: ReportType[] = [
  {
    id: 'basic_contact',
    name: 'Basic Contact Report',
    description: 'Essential contact information and property basics',
    price: 5.00,
    category: 'basic',
    icon: '📞',
    deliveryTime: 'Instant',
    features: [
      'Property owner/agent contact information',
      'Phone numbers and email addresses',
      'Basic property details and photos',
      'Listing agent information',
      'Property status and availability'
    ]
  },
  {
    id: 'legal_compliance',
    name: 'Legal Compliance Report',
    description: 'Costa Rica legal requirements and documentation status',
    price: 12.50,
    category: 'compliance',
    icon: '🏛️',
    deliveryTime: '24-48 hours',
    popular: true,
    features: [
      'Water concession status (AyA/ASADA permissions)',
      'Municipal permits and zoning compliance',
      'Environmental impact assessments',
      'Property registration status (Registro Nacional)',
      'Tax assessment and payment status',
      'Easements and right-of-way documentation',
      'Coastal zone (ZMT) compliance if applicable',
      'Forest coverage and protection status',
      'Basic contact information included'
    ]
  },
  {
    id: 'complete_due_diligence',
    name: 'Complete Due Diligence Report',
    description: 'Comprehensive property analysis for serious buyers',
    price: 25.00,
    category: 'premium',
    icon: '📋',
    deliveryTime: '48-72 hours',
    features: [
      'Everything from Legal Compliance Report',
      'Complete title search and ownership history',
      'Survey and boundary verification',
      'Construction permits and building code compliance',
      'Utility connections and service availability',
      'Neighboring property analysis',
      'Market comparable sales analysis',
      'Investment potential assessment',
      'Risk analysis and recommendations',
      'Professional legal review summary',
      'Priority support and consultation call'
    ]
  }
];

export const getReportTypeById = (id: string): ReportType | undefined => {
  return COSTA_RICA_REPORT_TYPES.find(report => report.id === id);
};

export const getReportsByCategory = (category: ReportType['category']): ReportType[] => {
  return COSTA_RICA_REPORT_TYPES.filter(report => report.category === category);
};

// Costa Rica specific legal requirements checklist
export const COSTA_RICA_LEGAL_REQUIREMENTS = [
  {
    category: 'Water Rights',
    items: [
      'AyA (Instituto Costarricense de Acueductos y Alcantarillados) permits',
      'ASADA (Asociación Administradora de Sistemas de Acueductos y Alcantarillados) approvals',
      'Well drilling permits if applicable',
      'Water quality certifications'
    ]
  },
  {
    category: 'Environmental Compliance',
    items: [
      'SETENA (Secretaría Técnica Nacional Ambiental) clearances',
      'Forest coverage declarations',
      'Wildlife corridor restrictions',
      'Coastal zone maritime zone compliance',
      'Wetland protection compliance'
    ]
  },
  {
    category: 'Municipal Requirements',
    items: [
      'Municipal building permits',
      'Land use compliance certificates',
      'Construction compliance certificates',
      'Municipal tax payment status',
      'Road access verification'
    ]
  },
  {
    category: 'National Registry',
    items: [
      'Property inscription in Registro Nacional',
      'Ownership title verification',
      'Lien and encumbrance search',
      'Boundary survey validation',
      'Easement registrations'
    ]
  }
];

export interface PropertyReport {
  propertyId: string;
  reportType: ReportType;
  requestedAt: string;
  deliveredAt?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  paymentId: string;
}