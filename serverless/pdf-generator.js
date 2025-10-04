const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const AWS = require('aws-sdk');
const crypto = require('crypto');

// Configure AWS S3 for PDF storage
const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'cr-mls-pdfs';

exports.handler = async (event) => {
  let browser = null;
  
  try {
    console.log('Starting PDF generation...');
    
    // Parse the request
    const body = JSON.parse(event.body);
    const { properties, category, email, template } = body;
    
    if (!properties || !Array.isArray(properties) || properties.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Properties array is required' })
      };
    }
    
    // Launch browser
    browser = await puppeteer.launch({
      args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    
    const page = await browser.newPage();
    
    // Generate HTML content for PDF
    const htmlContent = await generatePropertyListingHTML(properties, category, template);
    
    // Set content and generate PDF
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    // Generate unique filename
    const timestamp = new Date().toISOString().split('T')[0];
    const hash = crypto.createHash('md5').update(JSON.stringify(properties)).digest('hex').substring(0, 8);
    const filename = `cr-mls-${category}-${timestamp}-${hash}.pdf`;
    
    // Upload to S3
    const uploadResult = await s3.upload({
      Bucket: BUCKET_NAME,
      Key: `property-listings/${filename}`,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
      ACL: 'public-read',
      Metadata: {
        category: category,
        email: email || 'anonymous',
        property_count: properties.length.toString(),
        generated_at: new Date().toISOString()
      }
    }).promise();
    
    console.log(`PDF generated and uploaded: ${uploadResult.Location}`);\n    
    return {\n      statusCode: 200,\n      headers: {\n        'Content-Type': 'application/json',\n        'Access-Control-Allow-Origin': '*',\n        'Access-Control-Allow-Headers': 'Content-Type',\n        'Access-Control-Allow-Methods': 'POST'\n      },\n      body: JSON.stringify({\n        success: true,\n        pdf_url: uploadResult.Location,\n        filename: filename,\n        property_count: properties.length\n      })\n    };\n    \n  } catch (error) {\n    console.error('PDF generation error:', error);\n    \n    return {\n      statusCode: 500,\n      headers: {\n        'Content-Type': 'application/json',\n        'Access-Control-Allow-Origin': '*'\n      },\n      body: JSON.stringify({\n        error: 'Failed to generate PDF',\n        message: error.message\n      })\n    };\n    \n  } finally {\n    if (browser) {\n      await browser.close();\n    }\n  }\n};\n\nasync function generatePropertyListingHTML(properties, category, template = 'standard') {\n  const categoryConfig = {\n    residential: { name: 'Residential Properties', color: '#2563eb' },\n    commercial: { name: 'Commercial Properties', color: '#dc2626' },\n    land: { name: 'Land & Lots', color: '#059669' },\n    luxury: { name: 'Luxury Properties', color: '#7c2d12' }\n  };\n  \n  const config = categoryConfig[category] || categoryConfig.residential;\n  const currentDate = new Date().toLocaleDateString('en-US', {\n    year: 'numeric',\n    month: 'long',\n    day: 'numeric'\n  });\n  \n  const propertiesHTML = properties.map(property => `\n    <div class=\"property-item\">\n      <div class=\"property-header\">\n        <h3>${property.title || 'Property Listing'}</h3>\n        <div class=\"price\">$${formatPrice(property.price_usd || 0)} USD</div>\n      </div>\n      \n      <div class=\"property-body\">\n        <div class=\"property-info\">\n          <div class=\"location\">\n            <strong>📍 Location:</strong> ${property.location || 'Costa Rica'}\n          </div>\n          \n          ${property.description ? `\n            <div class=\"description\">\n              <strong>📋 Description:</strong>\n              <p>${property.description.substring(0, 300)}${property.description.length > 300 ? '...' : ''}</p>\n            </div>\n          ` : ''}\n          \n          <div class=\"details\">\n            <div class=\"detail-item\">\n              <strong>🏷️ Category:</strong> ${category.charAt(0).toUpperCase() + category.slice(1)}\n            </div>\n            <div class=\"detail-item\">\n              <strong>🌐 Source:</strong> ${property.source || 'CR-MLS'}\n            </div>\n            ${property.url ? `\n              <div class=\"detail-item\">\n                <strong>🔗 Link:</strong> ${property.url}\n              </div>\n            ` : ''}\n          </div>\n        </div>\n        \n        ${property.images && property.images.length > 0 ? `\n          <div class=\"property-images\">\n            <div class=\"image-grid\">\n              ${property.images.slice(0, 4).map(img => `\n                <div class=\"image-placeholder\">\n                  <span>📷 Image: ${img.split('/').pop()}</span>\n                </div>\n              `).join('')}\n            </div>\n          </div>\n        ` : ''}\n      </div>\n      \n      <div class=\"property-footer\">\n        <small>Listed: ${property.scraped_at ? new Date(property.scraped_at).toLocaleDateString() : currentDate}</small>\n        <small>ID: ${property.id || 'N/A'}</small>\n      </div>\n    </div>\n  `).join('\\n');\n  \n  return `\n<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Costa Rica MLS - ${config.name}</title>\n  <style>\n    * {\n      margin: 0;\n      padding: 0;\n      box-sizing: border-box;\n    }\n    \n    body {\n      font-family: 'Arial', sans-serif;\n      line-height: 1.6;\n      color: #333;\n      background: #f8fafc;\n    }\n    \n    .header {\n      background: linear-gradient(135deg, ${config.color}, ${adjustColor(config.color, -20)});\n      color: white;\n      padding: 30px 20px;\n      text-align: center;\n      margin-bottom: 30px;\n    }\n    \n    .header h1 {\n      font-size: 2.5em;\n      margin-bottom: 10px;\n      font-weight: 300;\n    }\n    \n    .header .subtitle {\n      font-size: 1.2em;\n      opacity: 0.9;\n    }\n    \n    .header .meta {\n      margin-top: 15px;\n      font-size: 0.95em;\n      opacity: 0.8;\n    }\n    \n    .container {\n      max-width: 800px;\n      margin: 0 auto;\n      padding: 0 20px;\n    }\n    \n    .property-item {\n      background: white;\n      border-radius: 12px;\n      margin-bottom: 25px;\n      box-shadow: 0 2px 8px rgba(0,0,0,0.1);\n      overflow: hidden;\n      page-break-inside: avoid;\n    }\n    \n    .property-header {\n      background: ${config.color};\n      color: white;\n      padding: 20px;\n      display: flex;\n      justify-content: space-between;\n      align-items: center;\n      flex-wrap: wrap;\n    }\n    \n    .property-header h3 {\n      font-size: 1.3em;\n      font-weight: 600;\n      margin: 0;\n      flex: 1;\n    }\n    \n    .price {\n      background: rgba(255,255,255,0.2);\n      padding: 8px 15px;\n      border-radius: 20px;\n      font-weight: bold;\n      font-size: 1.1em;\n      margin-left: 15px;\n    }\n    \n    .property-body {\n      padding: 25px;\n    }\n    \n    .property-info {\n      margin-bottom: 20px;\n    }\n    \n    .location {\n      font-size: 1.1em;\n      margin-bottom: 15px;\n      color: #4b5563;\n    }\n    \n    .description {\n      margin-bottom: 20px;\n    }\n    \n    .description p {\n      margin-top: 8px;\n      color: #6b7280;\n      line-height: 1.7;\n    }\n    \n    .details {\n      display: grid;\n      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n      gap: 12px;\n    }\n    \n    .detail-item {\n      color: #4b5563;\n      font-size: 0.95em;\n    }\n    \n    .image-grid {\n      display: grid;\n      grid-template-columns: repeat(2, 1fr);\n      gap: 10px;\n      margin-top: 15px;\n    }\n    \n    .image-placeholder {\n      background: #f3f4f6;\n      border: 2px dashed #d1d5db;\n      padding: 20px;\n      text-align: center;\n      border-radius: 8px;\n      color: #6b7280;\n      font-size: 0.9em;\n    }\n    \n    .property-footer {\n      background: #f8fafc;\n      padding: 15px 25px;\n      display: flex;\n      justify-content: space-between;\n      border-top: 1px solid #e5e7eb;\n      color: #6b7280;\n      font-size: 0.85em;\n    }\n    \n    .footer {\n      background: #1f2937;\n      color: white;\n      text-align: center;\n      padding: 30px;\n      margin-top: 40px;\n    }\n    \n    .footer p {\n      margin-bottom: 10px;\n    }\n    \n    .footer .contact {\n      font-size: 0.9em;\n      opacity: 0.8;\n    }\n    \n    @media print {\n      .header { page-break-after: avoid; }\n      .property-item { page-break-inside: avoid; }\n    }\n  </style>\n</head>\n<body>\n  <div class=\"header\">\n    <h1>🏠 Costa Rica MLS</h1>\n    <div class=\"subtitle\">${config.name}</div>\n    <div class=\"meta\">\n      Generated on ${currentDate} • ${properties.length} Properties\n    </div>\n  </div>\n  \n  <div class=\"container\">\n    ${propertiesHTML}\n  </div>\n  \n  <div class=\"footer\">\n    <p><strong>Costa Rica Multiple Listing Service</strong></p>\n    <p class=\"contact\">For more information, visit our website or contact our agents</p>\n    <p class=\"contact\">Generated: ${new Date().toISOString()}</p>\n  </div>\n</body>\n</html>\n  `;\n}\n\nfunction formatPrice(price) {\n  if (!price || price === 0) return '0';\n  return price.toLocaleString();\n}\n\nfunction adjustColor(color, percent) {\n  // Simple color adjustment function\n  const num = parseInt(color.replace('#', ''), 16);\n  const amt = Math.round(2.55 * percent);\n  const R = (num >> 16) + amt;\n  const G = (num >> 8 & 0x00FF) + amt;\n  const B = (num & 0x0000FF) + amt;\n  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +\n    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +\n    (B < 255 ? B < 1 ? 0 : B : 255))\n    .toString(16).slice(1);\n}"