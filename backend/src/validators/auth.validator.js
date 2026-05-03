import { body, validationResult } from 'express-validator'

function validateRequest(req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', data: { errors: errors.array() } })
    }
    next()
}

export const validateRegister = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .trim()
        .isEmail()
        .withMessage('Invalid email format'),

    body('contact')
        .trim()
        .notEmpty().withMessage('Contact is required')
        .matches(/^[0-9]{10}$/).withMessage('Contact must be a 10-digit number'),

    body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

    body('fullname')
        .trim()
        .notEmpty().withMessage('Fullname is required')
        .isLength({ min: 3 }).withMessage('Fullname must be at least 3 characters long'),
    body('isSeller')
        .optional()
        .isBoolean().withMessage('isSeller must be a boolean')
        .toBoolean(),

    validateRequest
]

export const validateLogin = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .trim()
        .isEmail()
        .withMessage('Invalid email format'),
    body('password')
        .trim()
        .notEmpty().withMessage('Password is required'),
    validateRequest
]
