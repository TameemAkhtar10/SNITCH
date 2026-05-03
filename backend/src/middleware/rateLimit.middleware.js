const windowMs = 15 * 60 * 1000
const maxRequests = 5
const store = new Map()

export const authRateLimit = (req, res, next) => {
    const key = `${req.ip}:${req.originalUrl}`
    const now = Date.now()
    const current = store.get(key) || { count: 0, resetAt: now + windowMs }

    if (now > current.resetAt) {
        current.count = 0
        current.resetAt = now + windowMs
    }

    current.count += 1
    store.set(key, current)

    if (current.count > maxRequests) {
        return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.', data: {} })
    }

    next()
}