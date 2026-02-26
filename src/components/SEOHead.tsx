import { useEffect } from 'react'

interface SEOHeadProps {
  title?: string
  description?: string
}

const APP_NAME = 'Munchies Catering'

export function SEOHead({ title, description }: SEOHeadProps) {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME
    if (description) {
      const tag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
      const prev_desc = tag?.content
      if (tag) tag.content = description
      return () => {
        document.title = prev
        if (tag && prev_desc !== undefined) tag.content = prev_desc
      }
    }
    return () => {
      document.title = prev
    }
  }, [title, description])

  return null
}
