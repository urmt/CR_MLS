import React from 'react';
import { ReportType } from '../types/reports';

interface ReportPreviewProps {
  reportType: ReportType;
  onClose: () => void;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ reportType, onClose }) => {
  const getSampleContent = () => {
    switch (reportType.id) {
      case 'basic_contact':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">🏢 Agent Information</h4>
              <div className="text-sm space-y-1">
                <p><strong>Source:</strong> Century21 CR / Coldwell Banker</p>
                <p><strong>Listing Agent:</strong> Available after payment</p>
                <p><strong>Phone:</strong> +506 xxxx-xxxx</p>
                <p><strong>WhatsApp:</strong> +506 xxxx-xxxx</p>
                <p><strong>Email:</strong> agent@company.cr</p>
                <p><strong>Office:</strong> Real estate agency details</p>
                <p><strong>Website:</strong> Direct property listing URL</p>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">📸 Property Media</h4>
              <p className="text-sm text-green-700">
                • All available property images from listing
                • Direct links to high-resolution photos
                • Property description and details
                • Original listing URL for more info
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">🏠 Property Details</h4>
              <div className="text-sm space-y-1">
                <p><strong>Property ID:</strong> From original listing</p>
                <p><strong>Listing Date:</strong> When scraped from source</p>
                <p><strong>Source:</strong> Encuentra24 / Craigslist / Agency</p>
                <p><strong>Category:</strong> House / Apartment / Land / Commercial</p>
                <p><strong>Bedrooms/Bathrooms:</strong> If available</p>
                <p><strong>Area:</strong> If provided in listing</p>
              </div>
            </div>
          </div>
        );

      case 'legal_compliance':
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notice</h4>
              <div className="text-sm space-y-1">
                <p><strong>Status:</strong> Legal data requires API credentials</p>
                <p><strong>Current:</strong> Property location and basic details only</p>
                <p><strong>Available:</strong> Province, canton, property type</p>
                <p><strong>Future:</strong> Full Registro Nacional integration planned</p>
                <p><strong>Note:</strong> Consult a Costa Rican attorney for legal advice</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">📍 Location Analysis</h4>
              <div className="text-sm space-y-1">
                <p><strong>Province:</strong> Identified from property address</p>
                <p><strong>Canton:</strong> Extracted when available</p>
                <p><strong>Coordinates:</strong> From listing when provided</p>
                <p><strong>Accessibility:</strong> Basic location assessment</p>
                <p><strong>Region Type:</strong> Urban / Rural / Coastal classification</p>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">💰 Market Context</h4>
              <div className="text-sm space-y-1">
                <p><strong>Price Range:</strong> Compared to similar properties</p>
                <p><strong>Currency:</strong> USD pricing with CRC equivalent</p>
                <p><strong>Market Segment:</strong> Luxury / Residential / Commercial</p>
                <p><strong>Source Reliability:</strong> Listing source verification</p>
              </div>
            </div>
          </div>
        );

      case 'complete_due_diligence':
        return (
          <div className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-semibold text-indigo-900 mb-2">📊 Market Comparison</h4>
              <div className="text-sm space-y-1">
                <p><strong>Price Position:</strong> Compared to similar listings</p>
                <p><strong>Category Analysis:</strong> Within property type range</p>
                <p><strong>Location Factor:</strong> Province/region price context</p>
                <p><strong>Currency Info:</strong> USD/CRC exchange rate applied</p>
                <p><strong>Market Source:</strong> Based on current listings data</p>
              </div>
            </div>

            <div className="bg-teal-50 p-4 rounded-lg">
              <h4 className="font-semibold text-teal-900 mb-2">🏠 Listing Information</h4>
              <div className="text-sm space-y-1">
                <p><strong>First Seen:</strong> When first scraped by our system</p>
                <p><strong>Source Platform:</strong> Encuentra24 / Craigslist / Agency</p>
                <p><strong>Listing Quality:</strong> Image count, description detail</p>
                <p><strong>Contact Method:</strong> How to reach listing agent</p>
                <p><strong>Updates:</strong> Any changes detected in re-scraping</p>
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg">
              <h4 className="font-semibold text-emerald-900 mb-2">💰 Data Available</h4>
              <div className="text-sm space-y-1">
                <p><strong>Basic Info:</strong> Price, location, description, images</p>
                <p><strong>Property Details:</strong> Bedrooms, bathrooms, area (if listed)</p>
                <p><strong>Contact Access:</strong> Agent/seller contact information</p>
                <p><strong>Source Link:</strong> Direct link to original listing</p>
                <p><strong>Category:</strong> Property type classification</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">🔍 Future Enhancements</h4>
              <div className="text-sm space-y-1">
                <p><strong>API Integration:</strong> BCCR economic data planned</p>
                <p><strong>Legal Data:</strong> Registro Nacional integration</p>
                <p><strong>Municipal Info:</strong> Property tax and permit data</p>
                <p><strong>Risk Assessment:</strong> Flood zones and environmental</p>
              </div>
            </div>
          </div>
        );

      default:
        return <p>Report preview not available</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{reportType.name} - Sample</h3>
            <p className="text-sm text-red-600 font-medium">⚠️ This is SAMPLE data for preview only</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Current Status:</strong> Reports contain real property listing data from Encuentra24, Craigslist, and real estate agencies. 
              Legal/government data integration is planned and will be added as API credentials become available. 
              All contact information and property details come from actual sources.
            </p>
          </div>
          
          {getSampleContent()}
          
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-900">Report Price: ${reportType.price.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Delivered via email in {reportType.deliveryTime}</p>
              </div>
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;