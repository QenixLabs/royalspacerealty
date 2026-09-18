'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Login failed')
      router.push('/admin/properties')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Check password and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="grid min-h-dvh place-items-center p-4"
      style={{ background: 'var(--rs-grad-soft)' }}
      aria-label="Admin login"
    >
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div
            className="mb-2 flex size-11 items-center justify-center rounded-xl text-white"
            style={{ background: 'var(--rs-grad)' }}
            aria-hidden="true"
          >
            <Building2 className="size-5" />
          </div>
          <CardTitle className="text-lg">Royal Space · Admin</CardTitle>
          <CardDescription>Enter the admin password to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-pass">
                <Lock className="size-3.5" aria-hidden="true" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="admin-pass"
                  type={show ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  aria-describedby={error ? 'login-error' : undefined}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                  className="absolute top-1/2 right-1 -translate-y-1/2"
                >
                  {show ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                </Button>
              </div>
              {error && (
                <p id="login-error" role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
            <Button type="submit" disabled={loading} className="w-full text-white" style={{ background: 'var(--rs-grad)' }}>
              {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
