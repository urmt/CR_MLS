export interface Property {
  _id: string
  title: string
  description: string
  price: number
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  propertyType: 'house' | 'apartment' | 'land' | 'commercial'
  bedrooms: number
  bathrooms: number
  area: number
  images: string[]
  agent: {
    _id: string
    name: string
    email: string
    phone?: string
  }
  createdAt: string
  updatedAt: string
}
