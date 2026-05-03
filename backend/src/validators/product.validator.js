import { body, validationResult } from 'express-validator'

const validateRequest = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', data: { errors: errors.array() } })
    }
    next()
}

export const validateCreateProduct = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('priceAmount').isFloat({ gt: 0 }).withMessage('Price must be a valid number greater than 0'),
    body('priceCurrency').optional().isString().withMessage('Price currency must be a string'),
    body('stock').notEmpty().withMessage('Stock is required').isInt({ min: 0 }).withMessage('Stock must be a number greater than or equal to 0'),
    validateRequest,
]

export const validateUpdateProduct = [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
    body('priceAmount').optional().isFloat({ gt: 0 }).withMessage('Price must be a valid number greater than 0'),
    body('priceCurrency').optional().isString().withMessage('Price currency must be a string'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a number greater than or equal to 0'),
    validateRequest,
]