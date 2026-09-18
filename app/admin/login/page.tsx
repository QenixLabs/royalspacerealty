'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock } from 'lucide-react'

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
    <main className="rs-site" style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#f4f4f4', padding: 20 }}>
      <form onSubmit={submit} className="rs-contact-form-wrap" style={{ width: 'min(420px,100%)' }} aria-label="Admin login">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={18} aria-hidden="true" /> Admin Login</h3>
        <label htmlFor="admin-pass" style={{ fontSize: 12, fontWeight: 700 }}>PASSWORD</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input id="admin-pass" type={show ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter admin password" style={{ flex: 1 }} aria-describedby={error ? 'login-error' : undefined} />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} style={{ minWidth: 44, minHeight: 44 }}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        {error && <p id="login-error" role="alert" style={{ color: '#b91c1c', fontSize: 13 }}>{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'SIGNING IN…' : 'SIGN IN'}</button>
      </form>
    </main>
  )
}
