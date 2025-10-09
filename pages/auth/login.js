import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function LoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to homepage and open AuthModal in login mode
    router.replace('/?auth=login')
  }, [router])

  return null
}
