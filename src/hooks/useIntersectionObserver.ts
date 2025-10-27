'use client'

import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverProps {
  threshold?: number
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = false
}: UseIntersectionObserverProps = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const [node, setNode] = useState<Element | null>(null)
  const observer = useRef<IntersectionObserver | null>(null)

  const frozen = entry?.isIntersecting && freezeOnceVisible

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry)
  }

  useEffect(() => {
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || frozen || !node) return

    const observerParams = { threshold, root, rootMargin }
    const currentObserver = new IntersectionObserver(updateEntry, observerParams)

    observer.current = currentObserver
    currentObserver.observe(node)

    return () => currentObserver.disconnect()
  }, [node, threshold, root, rootMargin, frozen])

  useEffect(() => {
    if (frozen) {
      observer.current?.disconnect()
    }
  }, [frozen])

  return [setNode, entry] as const
}

// Hook for lazy loading images
export function useLazyImage(src: string, options?: UseIntersectionObserverProps) {
  const [node, entry] = useIntersectionObserver(options)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    if (entry?.isIntersecting) {
      setIsInView(true)
    }
  }, [entry])

  useEffect(() => {
    if (isInView && src) {
      const img = new Image()
      img.onload = () => setIsLoaded(true)
      img.src = src
    }
  }, [isInView, src])

  return { ref: node, isLoaded, isInView }
}

