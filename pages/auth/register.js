import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function RegisterRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to homepage and open AuthModal in register mode
    router.replace('/?auth=register')
  }, [router])

  return null
}
