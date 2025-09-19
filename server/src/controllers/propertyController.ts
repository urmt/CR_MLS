// @desc    Check if user has access to property contact info
// @route   GET /api/properties/:id/access
// @access  Private
export const checkPropertyAccess = asyncHandler(async (req: Request, res: Response) => {
  const property = await Property.findById(req.params.id)
  
  if (!property) {
    res.status(404)
    throw new Error('Property not found')
  }

  // Check if user has purchased access or is the agent
  const hasAccess = 
    property.accessList.includes(req.user.id) || 
    property.agent.toString() === req.user.id

  res.json({ hasAccess })
})
