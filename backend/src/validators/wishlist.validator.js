import { body, validationResult } from 'express-validator'

const validateRequest = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', data: { errors: errors.array() } })
    }
    next()
}

export const validateAddWishlist = [
    body('productId').trim().notEmpty().withMessage('Product ID is required'),
    validateRequest,
]