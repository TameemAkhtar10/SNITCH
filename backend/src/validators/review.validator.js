import { body, validationResult } from 'express-validator'

const validateRequest = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', data: { errors: errors.array() } })
    }
    next()
}

export const validateAddReview = [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
    body('comment').optional().isString().withMessage('Comment must be a string'),
    validateRequest,
]