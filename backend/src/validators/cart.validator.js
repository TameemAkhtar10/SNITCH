import {param, body,validationResult} from 'express-validator';

const validaterequst = (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    next();
}

export const validateAddToCart = [
    param('productId').isMongoId().withMessage('Invalid product ID'),
    param('variantId').optional().isMongoId().withMessage('Invalid variant ID'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('currency').isIn(["USD", "EUR", "GBP", "JPY", "INR"]).withMessage('Invalid currency'),
    validaterequst
];