import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { Property } from '../models/Property'

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
    contact 
  } = req.body

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
    contact
  })

  res.status(201).json(property)
})
