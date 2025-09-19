import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { Property } from '../models/Property'
import { 
  verifyFolioReal,
  checkLegalCompliance
} from '../services/verificationService'

// @desc    Create a new property listing
// @route   POST /api/properties
// @access  Public
export const createProperty = asyncHandler(async (req: Request, res: Response) => {
  const { legalDetails, ...propertyData } = req.body

  // Verify Folio Real before creating
  if (!await verifyFolioReal(legalDetails.folioReal)) {
    res.status(400)
    throw new Error('Invalid Folio Real. Please verify with the National Registry.')
  }

  const property = await Property.create({
    ...propertyData,
    legalDetails
  })

  res.status(201).json(property)
})

// @desc    Get property by ID
// @route   GET /api/properties/:id
// @access  Public
export const getPropertyById = asyncHandler(async (req: Request, res: Response) => {
  const property = await Property.findById(req.params.id)
  
  if (!property) {
    res.status(404)
    throw new Error('Property not found')
  }
  
  res.json(property)
})

// @desc    Check if user has access to property contact info
// @route   GET /api/properties/:id/access
// @access  Public
export const checkPropertyAccess = asyncHandler(async (req: Request, res: Response) => {
  const property = await Property.findById(req.params.id)
  const { email } = req.query // Get email from query params
  
  if (!property) {
    res.status(404)
    throw new Error('Property not found')
  }

  const hasAccess = email 
    ? property.accessList.includes(email as string)
    : false

  res.json({ hasAccess })
})

// @desc    Verify property legal compliance
// @route   GET /api/properties/:id/verify
// @access  Public
export const verifyProperty = asyncHandler(async (req: Request, res: Response) => {
  const property = await Property.findById(req.params.id)
  
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
