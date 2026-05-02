/**
 * Performance optimization utilities for CHONK9K app
 */

// Cache for expensive computations
const computationCache = new Map()

/**
 * Memoize expensive function results
 */
export function memoize(fn, ttl = 5000) {
  return function(...args) {
    const key = JSON.stringify(args)
    const cached = computationCache.get(key)
    
    if (cached && Date.now() - cached.time < ttl) {
      return cached.value
    }
    
    const value = fn(...args)
    computationCache.set(key, { value, time: Date.now() })
    
    // Clean up old entries after ttl
    if (computationCache.size > 100) {
      const now = Date.now()
      for (const [k, v] of computationCache.entries()) {
        if (now - v.time > ttl * 2) {
          computationCache.delete(k)
        }
      }
    }
    
    return value
  }
}

/**
 * Debounce function calls to prevent excessive updates
 */
export function debounce(fn, delay = 300) {
  let timeoutId
  return function(...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Throttle function calls to limit frequency
 */
export function throttle(fn, limit = 1000) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Request idle callback polyfill with fallback
 */
export function onIdle(callback) {
  if (typeof requestIdleCallback !== 'undefined') {
    return requestIdleCallback(callback)
  }
  return setTimeout(callback, 1)
}

/**
 * Preload image for faster display
 */
export function preloadImage(src) {
  const img = new Image()
  img.src = src
  return img
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Monitor and report performance metrics
 */
export function reportWebVitals() {
  if (typeof window === 'undefined') return
  
  // Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        console.log('[Performance] LCP:', lastEntry.renderTime || lastEntry.loadTime)
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      // LCP not supported
    }
  }
  
  // First Input Delay
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          console.log('[Performance] FID:', entry.processingDuration)
        })
      })
      observer.observe({ entryTypes: ['first-input'] })
    } catch (e) {
      // FID not supported
    }
  }
}
