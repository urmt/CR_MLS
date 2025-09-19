import express from 'express'
import { checkPropertyAccess } from '../controllers/propertyController'

// Add to existing routes
router.get('/:id/access', protect, checkPropertyAccess)
