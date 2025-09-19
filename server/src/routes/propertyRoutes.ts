import express from 'express'
import { 
  createProperty,
  getPropertyById,
  checkPropertyAccess,
  verifyProperty
} from '../controllers/propertyController'
import { completeManualVerification } from '../services/manualVerificationService'

const router = express.Router()

// Define routes
router.post('/', createProperty)
router.get('/:id', getPropertyById)
router.get('/:id/access', checkPropertyAccess) // No authentication needed
router.get('/:id/verify', verifyProperty)
router.post('/:id/verify-callback', (req, res) => {
  const { verified } = req.body
  completeManualVerification(req.params.id, verified)
  res.status(200).send()
})

export default router
