import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { Property } from '../models/Property'
import { checkLegalCompliance } from '../services/verificationService'

// @desc    Verify property legal compliance
// @route   GET /api/properties/:id/verify
// @access  Public
export const verifyProperty = asyncHandler(async (req: Request, res: Response) => {
  const property = await Property.findById(req.params.id)
    .populate('legalDetails') // Ensure legal details are populated
  
  if (!property) {
    res.status(404)
    throw new Error('Property not found')
  }

  const compliance = await checkLegalCompliance(property)
  
  res.json({
    propertyId: property._id,
    compliant: compliance.compliant,
    details: compliance.requirements
  })
})

// @desc    Create a new property listing
// @route   POST /api/properties
// @access  Public
export const createProperty = asyncHandler(async (req: Request, res: Response) => {
  const { 
    title, 
    description, 
    price, 
    location, 
    coordinates, 
    propertyType, 
    bedrooms, 
    bathrooms, 
    area, 
    images, 
    contact,
    legalDetails // ADD LEGAL DETAILS
  } = req.body

  // First verify the Folio Real before creating
  const folioRealValid = await verifyFolioReal(legalDetails.folioReal)
  if (!folioRealValid) {
    res.status(400)
    throw new Error('Invalid Folio Real. Please verify with the National Registry.')
  }

  const property = await Property.create({
    title,
    description,
    price,
    location,
    coordinates,
    propertyType,
    bedrooms,
    bathrooms,
    area,
    images,
    contact,
    legalDetails // SAVE LEGAL DETAILS
  })

  res.status(201).json(property)
})
