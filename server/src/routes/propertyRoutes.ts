import express from 'express'
import { checkPropertyAccess } from '../controllers/propertyController'

// Add to existing routes
router.get('/:id/access', protect, checkPropertyAccess)
import { verifyProperty } from '../controllers/propertyController'

// Add to routes
router.get('/:id/verify', verifyProperty)
