#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

// Generate sample Costa Rica properties for testing
async function generateTestProperties() {
  console.log('🏠 Generating test properties for Costa Rica MLS...');

  const properties = [
    {
      id: 'prop001',
      title: 'Luxury Beachfront Villa in Manuel Antonio',
      price_usd: 850000,
      price_text: '$850,000',
      location: 'Manuel Antonio, Puntarenas',
      description: 'Stunning 4-bedroom beachfront villa with panoramic ocean views, private pool, and direct beach access. Perfect for luxury vacation rental or permanent residence.',
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'
      ],
      url: 'https://example.com/manuel-antonio-villa',
      source: 'coldwell_banker_cr',
      category: 'luxury',
      scraped_at: new Date().toISOString()
    },
    {
      id: 'prop002',
      title: 'Modern Condo in Escazú with City Views',
      price_usd: 320000,
      price_text: '$320,000',
      location: 'Escazú, San José',
      description: '3-bedroom, 2.5-bathroom modern condominium in exclusive Escazú development. Features include granite countertops, stainless steel appliances, and spectacular city views.',
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
      ],
      url: 'https://example.com/escazu-condo',
      source: 'remax_oceansurf',
      category: 'residential',
      scraped_at: new Date().toISOString()
    },
    {
      id: 'prop003',
      title: 'Coffee Farm Estate in Monteverde',
      price_usd: 1200000,
      price_text: '$1,200,000',
      location: 'Monteverde, Puntarenas',
      description: '50-hectare working coffee farm with colonial-style main house, processing facilities, and breathtaking cloud forest views. Established profitable operation.',
      images: [
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800',
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800'
      ],
      url: 'https://example.com/monteverde-farm',
      source: 'krain_real_estate',
      category: 'commercial',
      scraped_at: new Date().toISOString()
    },
    {
      id: 'prop004',
      title: 'Beachfront Land in Tamarindo',
      price_usd: 450000,
      price_text: '$450,000',
      location: 'Tamarindo, Guanacaste',
      description: '2,500 m² of prime beachfront land perfect for luxury development. Direct beach access, stunning sunset views, and all utilities available.',
      images: [
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
      ],
      url: 'https://example.com/tamarindo-land',
      source: 'costa_rica_real_estate_service',
      category: 'land',
      scraped_at: new Date().toISOString()
    },
    {
      id: 'prop005',
      title: 'Mountain Retreat in San Gerardo de Dota',
      price_usd: 285000,
      price_text: '$285,000',
      location: 'San Gerardo de Dota, San José',
      description: 'Eco-friendly mountain retreat with 3 bedrooms, organic gardens, and panoramic valley views. Perfect for nature lovers and bird watchers.',
      images: [
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
        'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800'
      ],
      url: 'https://example.com/dota-retreat',
      source: 'neocasa_cr',
      category: 'residential',
      scraped_at: new Date().toISOString()
    },
    {
      id: 'prop006',
      title: 'Downtown San José Commercial Building',
      price_usd: 980000,
      price_text: '$980,000',
      location: 'Downtown San José',
      description: '6-story commercial building in prime downtown location. Currently generating $8,000/month rental income. Great investment opportunity.',
      images: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'
      ],
      url: 'https://example.com/sj-commercial',
      source: 'conexion_inmobiliaria',
      category: 'commercial',
      scraped_at: new Date().toISOString()
    },
    {
      id: 'prop007',
      title: 'Ocean View Home in Dominical',
      price_usd: 425000,
      price_text: '$425,000',
      location: 'Dominical, Puntarenas',
      description: 'Beautiful 2-bedroom home with stunning ocean views, tropical gardens, and minutes from world-class surfing beaches.',
      images: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
      ],
      url: 'https://example.com/dominical-home',
      source: 'immo_costa_rica',
      category: 'residential',
      scraped_at: new Date().toISOString()
    },
    {
      id: 'prop008',
      title: 'Luxury Penthouse in Santa Ana',
      price_usd: 750000,
      price_text: '$750,000',
      location: 'Santa Ana, San José',
      description: 'Ultra-modern penthouse with 360-degree views, private elevator, rooftop terrace, and premium finishes throughout.',
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
      ],
      url: 'https://example.com/santa-ana-penthouse',
      source: 'terraquea',
      category: 'luxury',
      scraped_at: new Date().toISOString()
    },
    {
      id: 'prop009',
      title: 'Jungle Lodge in Puerto Viejo',
      price_usd: 350000,
      price_text: '$350,000',
      location: 'Puerto Viejo, Limón',
      description: 'Unique jungle lodge with 8 guest rooms, restaurant, and adventure tour business. Established eco-tourism operation.',
      images: [
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'
      ],
      url: 'https://example.com/puerto-viejo-lodge',
      source: 'casa_de_manana',
      category: 'commercial',
      scraped_at: new Date().toISOString()
    },
    {
      id: 'prop010',
      title: 'Residential Development Land in Cartago',
      price_usd: 180000,
      price_text: '$180,000',
      location: 'Cartago, Cartago',
      description: '15,000 m² of prime residential development land with mountain views, approved permits, and infrastructure ready.',
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
        'https://images.unsplash.com/photo-1440066768056-0ad37212aa97?w=800'
      ],
      url: 'https://example.com/cartago-development',
      source: 'inhaus_cr',
      category: 'land',
      scraped_at: new Date().toISOString()
    }
  ];

  // Save to active properties
  const activeFile = path.join(__dirname, '../database/properties/active.json');
  const activeData = {
    properties,
    last_updated: new Date().toISOString(),
    total_count: properties.length
  };

  await fs.ensureDir(path.dirname(activeFile));
  await fs.writeJson(activeFile, activeData, { spaces: 2 });

  // Save to client public database as fallback
  const clientDbFile = path.join(__dirname, '../client/public/database/properties/active.json');
  await fs.ensureDir(path.dirname(clientDbFile));
  await fs.writeJson(clientDbFile, activeData, { spaces: 2 });

  console.log(`✅ Generated ${properties.length} test properties`);
  console.log(`💾 Saved to: ${activeFile}`);
  console.log(`💾 Saved to: ${clientDbFile}`);
  
  return properties;
}

// Run if called directly
if (require.main === module) {
  generateTestProperties()
    .then(properties => {
      console.log('🎉 Test data generation completed!');
      console.log('Your IPFS site should now show properties when refreshed.');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Failed to generate test data:', error);
      process.exit(1);
    });
}

module.exports = generateTestProperties;