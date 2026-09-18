# Admin Property CRUD + Login + Inquiries Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add password-gated `/admin` with Property CRUD (Cloudinary images, Mongo Atlas) and Inquiries inbox fed by contact form + property Enquire CTA.

**Architecture:** Stateless JWT cookie (`rs_admin`, jose HS256, 12h) verified in `middleware.ts`; Mongoose models `Property`/`Inquiry` with static fallback when `MONGODB_URI` missing; Cloudinary server-signed uploads (client uploads direct to Cloudinary with signature); public `POST /api/inquiries` writes inbox.

**Tech Stack:** Next.js 16.3.3 App Router, React 19, Tailwind 4, shadcn base-nova, lucide-react, mongoose, cloudinary, jose.

---

## File Structure

| File | Responsibility |
|---|---|
| `.env.example` (modify) | Document `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `MONGODB_URI`, `CLOUDINARY_*` |
| `package.json` (modify) | Add `mongoose`, `cloudinary`, `jose` |
| `lib/db.ts` (create) | Cached Mongoose connect, `dbReady()` false when no URI |
| `lib/auth.ts` (create) | `signAdminToken()`, `verifyAdminToken()`, `rateLimit()`, cookie name/age |
| `models/Property.ts` (create) | Property schema: slug unique, configs, amenities, images `{public_id,secure_url,cover}` |
| `models/Inquiry.ts` (create) | Inquiry schema: name/phone/intent/source/status/propertySlug/notes |
| `lib/properties-db.ts` (create) | `listPropertiesDB()`, `getPropertyDB()` — DB first, static `lib/properties.ts` fallback |
| `middleware.ts` (create) | Gate `/admin/*` except `/admin/login`; verify JWT, redirect else |
| `app/api/admin/login/route.ts` (create) | POST password → set cookie; rate-limited |
| `app/api/admin/logout/route.ts` (create) | POST clears cookie |
| `app/api/admin/seed/route.ts` (create) | POST seeds 13 static properties into Atlas (protected) |
| `app/api/admin/properties/route.ts` (create) | GET list + POST create (protected) |
| `app/api/admin/properties/[id]/route.ts` (create) | PATCH + DELETE by id (protected) |
| `app/api/admin/sign-upload/route.ts` (create) | POST returns Cloudinary signature (protected) |
| `app/api/admin/inquiries/route.ts` (create) | GET list + filters (protected) |
| `app/api/admin/inquiries/[id]/route.ts` (create) | PATCH status/notes (protected) |
| `app/api/inquiries/route.ts` (create) | Public POST: contact + property CTA → Inquiry |
| `app/admin/login/page.tsx` (create) | Password form, show/hide, error near field |
| `app/admin/layout.tsx` (create) | Sidebar ≥1024px / topbar mobile, logout, nav Properties/Inquiries/View site |
| `app/admin/page.tsx` (create) | Redirect to `/admin/properties` |
| `app/admin/properties/page.tsx` (create) | Search/filter/sort table (desktop) + cards (mobile) |
| `app/admin/properties/[id]/page.tsx` (create) | Create/edit form: basics, configs rows, chips, images uploader |
| `components/admin/image-uploader.tsx` (create) | File pick → sign → direct Cloudinary upload → preview/reorder/cover/delete |
| `app/admin/inquiries/page.tsx` (create) | KPIs + filters + inbox table/cards + detail drawer |
| `components/contact-form.tsx` (modify) | POST to `/api/inquiries` source `contact`, loading/success/error states |
| `components/property-enquire.tsx` (create) | Per-property Enquire form posting `propertySlug`, used on detail aside |
| `app/projects/[slug]/page.tsx` (modify) | Replace `/contact` CTA link with `<PropertyEnquire/>` |
| `app/globals.css` (modify) | Add `.rs-admin` styles reusing purple tokens, responsive tables, drawer |

---

### Task 1: Foundation — deps + env + db + auth helpers

**Files:**
- Modify: `package.json`
- Modify: `.env.example` (create if missing — check root; repo currently has no `.env*`)
- Create: `lib/db.ts`
- Create: `lib/auth.ts`

- [ ] **Step 1: Install deps**

Run: `pnpm add mongoose cloudinary jose`
Expected: `package.json` gains 3 deps, lockfile updates, exit 0.

- [ ] **Step 2: Add env template**

Create `.env.example` with exact content:

```bash
ADMIN_PASSWORD=change-me-strong-password
ADMIN_SESSION_SECRET=32-char-minimum-random-string-change-me
MONGODB_URI=mongodb+srv://user:pass@cluster/db?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud
```

- [ ] **Step 3: Create `lib/db.ts`**

```ts
import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI ?? ''
let cached = (global as unknown as { __rsMongoose?: Promise<typeof mongoose> }).__rsMongoose

export function dbReady() {
  return uri.length > 10
}

export async function dbConnect() {
  if (!dbReady()) throw new Error('MONGODB_URI missing')
  if (!cached) {
    cached = mongoose.connect(uri, { maxPoolSize: 5 })
    ;(global as unknown as { __rsMongoose?: Promise<typeof mongoose> }).__rsMongoose = cached
  }
  return cached
}
```

- [ ] **Step 4: Create `lib/auth.ts`**

```ts
import { SignJWT, jwtVerify } from 'jose'
import crypto from 'node:crypto'

export const ADMIN_COOKIE = 'rs_admin'
export const ADMIN_MAX_AGE = 60 * 60 * 12

const secret = () => new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET ?? '')

export async function signAdminToken() {
  if ((process.env.ADMIN_SESSION_SECRET ?? '').length < 32)
    throw new Error('ADMIN_SESSION_SECRET too short')
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_MAX_AGE}s`)
    .sign(secret())
}

export async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify(token, secret())
  return payload.role === 'admin'
}

export function passwordOk(input: string) {
  const a = Buffer.from(input ?? '')
  const b = Buffer.from(process.env.ADMIN_PASSWORD ?? '')
  return a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b)
}

const hits = new Map<string, { n: number; t: number }>()
export function loginRateLimited(ip: string) {
  const now = Date.now()
  const h = hits.get(ip) ?? { n: 0, t: now }
  if (now - h.t > 10 * 60 * 1000) return (hits.set(ip, { n: 1, t: now }), false)
  h.n += 1
  hits.set(ip, h)
  return h.n > 5
}
```

- [ ] **Step 5: Verify types**

Run: `pnpm exec tsc --noEmit`
Expected: PASS, no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml .env.example lib/db.ts lib/auth.ts
git commit -m "feat: admin foundation deps env db auth helpers"
```

---

### Task 2: Models + DB accessor + seed route

**Files:**
- Create: `models/Property.ts`
- Create: `models/Inquiry.ts`
- Create: `lib/properties-db.ts`
- Create: `app/api/admin/seed/route.ts`

- [ ] **Step 1: Create `models/Property.ts`**

```ts
import { Schema, model, models } from 'mongoose'

const Config = new Schema(
  { bhk: { type: String, required: true }, area: { type: String, required: true }, price: String },
  { _id: false },
)
const Img = new Schema(
  { public_id: { type: String, required: true }, secure_url: { type: String, required: true }, cover: Boolean },
  { _id: false },
)

const PropertySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    builder: { type: String, required: true },
    location: { type: String, required: true },
    address: { type: String, required: true },
    rera: String,
    status: { type: String, required: true },
    possession: String,
    tagline: String,
    overview: { type: [String], default: [] },
    configurations: { type: [Config], default: [] },
    amenities: { type: [String], default: [] },
    connectivity: { type: [String], default: [] },
    priceDisplay: { type: String, required: true },
    areaDisplay: { type: String, required: true },
    bhkDisplay: { type: String, required: true },
    category: { type: String, enum: ['Residential', 'Commercial'], default: 'Residential' },
    mapUrl: String,
    images: { type: [Img], default: [] },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export const PropertyModel = models.Property ?? model('Property', PropertySchema)
```

- [ ] **Step 2: Create `models/Inquiry.ts`**

```ts
import { Schema, model, models } from 'mongoose'

const InquirySchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    intent: { type: String, enum: ['Buy', 'Sell', 'Rent', 'Submit', 'Other'], default: 'Buy' },
    message: String,
    propertySlug: { type: String, index: true },
    source: { type: String, enum: ['contact', 'property-cta'], required: true },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new', index: true },
    notes: String,
  },
  { timestamps: true },
)

export const InquiryModel = models.Inquiry ?? model('Inquiry', InquirySchema)
```

- [ ] **Step 3: Create `lib/properties-db.ts`**

```ts
import { dbConnect, dbReady } from './db'
import { PropertyModel } from '@/models/Property'
import { properties as statics, propertyImages, type Property } from './properties'

export type DbProperty = Property & { _id: string; images: { public_id: string; secure_url: string; cover?: boolean }[] }

export async function listPropertiesDB(): Promise<DbProperty[]> {
  if (!dbReady()) return statics.map((p) => ({ ...p, _id: p.slug, images: propertyImages(p).map((u, i) => ({ public_id: `legacy/${p.slug}/${i}`, secure_url: u, cover: i === 0 })) }))
  await dbConnect()
  const docs = await PropertyModel.find({}).sort({ updatedAt: -1 }).lean()
  if (!docs.length) return statics.map((p) => ({ ...p, _id: p.slug, images: propertyImages(p).map((u, i) => ({ public_id: `legacy/${p.slug}/${i}`, secure_url: u, cover: i === 0 })) }))
  return docs.map((d: Record<string, unknown>) => ({ ...(d as object), _id: String((d as { _id: unknown })._id) }) as DbProperty)
}
```

- [ ] **Step 4: Create `app/api/admin/seed/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE } from '@/lib/auth'
import { verifyAdminToken } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { PropertyModel } from '@/models/Property'
import { properties, propertyImages } from '@/lib/properties'

export async function POST() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value
  if (!token || !(await verifyAdminToken(token).catch(() => false)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await dbConnect()
  let upserted = 0
  for (const p of properties) {
    const images = propertyImages(p).map((u, i) => ({ public_id: `legacy/${p.slug}/${i}`, secure_url: u, cover: i === 0 }))
    await PropertyModel.updateOne({ slug: p.slug }, { $setOnInsert: { ...p, images } }, { upsert: true })
    upserted += 1
  }
  return NextResponse.json({ ok: true, upserted })
}
```

- [ ] **Step 5: Verify**

Run: `pnpm exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add models/Property.ts models/Inquiry.ts lib/properties-db.ts app/api/admin/seed/route.ts
git commit -m "feat: property inquiry models db accessor seed route"
```

---

### Task 3: Auth routes + middleware + login UI

**Files:**
- Create: `app/api/admin/login/route.ts`
- Create: `app/api/admin/logout/route.ts`
- Create: `middleware.ts`
- Create: `app/admin/login/page.tsx`

- [ ] **Step 1: Create `app/api/admin/login/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, ADMIN_MAX_AGE, loginRateLimited, passwordOk, signAdminToken } from '@/lib/auth'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'local'
  if (loginRateLimited(ip)) return NextResponse.json({ error: 'Too many attempts. Try later.' }, { status: 429 })
  const { password } = (await req.json().catch(() => ({}))) as { password?: string }
  if (!passwordOk(password ?? '')) return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
  const token = await signAdminToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: ADMIN_MAX_AGE })
  return res
}
```

- [ ] **Step 2: Create `app/api/admin/logout/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { ADMIN_COOKIE } from '@/lib/auth'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, '', { path: '/', maxAge: 0 })
  return res
}
```

- [ ] **Step 3: Create `middleware.ts`**

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') return NextResponse.next()
  const token = req.cookies.get('rs_admin')?.value
  const secret = new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET ?? '')
  try {
    await jwtVerify(token ?? '', secret)
    return NextResponse.next()
  } catch {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }
}

export const config = { matcher: ['/admin/:path*'] }
```

- [ ] **Step 4: Create `app/admin/login/page.tsx`**

```tsx
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
```

- [ ] **Step 5: Manual verify**

Run: `pnpm exec tsc --noEmit` then `ADMIN_PASSWORD=test123 ADMIN_SESSION_SECRET=0123456789abcdef0123456789abcdef pnpm dev`
Expected: visit `/admin/properties` redirects to `/admin/login`; login with `test123` lands on properties.

- [ ] **Step 6: Commit**

```bash
git add app/api/admin/login/route.ts app/api/admin/logout/route.ts middleware.ts app/admin/login/page.tsx
git commit -m "feat: env-gate admin auth login middleware"
```

---

### Task 4: Inquiries API + contact wire + property CTA

**Files:**
- Create: `app/api/inquiries/route.ts`
- Modify: `components/contact-form.tsx`
- Create: `components/property-enquire.tsx`
- Modify: `app/projects/[slug]/page.tsx:183-186`

- [ ] **Step 1: Create `app/api/inquiries/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { dbConnect, dbReady } from '@/lib/db'
import { InquiryModel } from '@/models/Inquiry'

const phoneRe = /^[+\d][\d\s-]{7,15}$/

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, string>
  const name = (b.name ?? '').trim()
  const phone = (b.phone ?? '').trim()
  const intent = ['Buy', 'Sell', 'Rent', 'Submit'].includes(b.intent) ? b.intent : 'Buy'
  if (name.length < 2) return NextResponse.json({ error: 'Enter your full name.' }, { status: 400 })
  if (!phoneRe.test(phone)) return NextResponse.json({ error: 'Enter a valid mobile number.' }, { status: 400 })
  if (!dbReady()) return NextResponse.json({ ok: true, queued: false })
  await dbConnect()
  const doc = await InquiryModel.create({
    name, phone, email: b.email ?? '', intent,
    message: b.message ?? '', propertySlug: b.propertySlug ?? undefined,
    source: b.propertySlug ? 'property-cta' : 'contact',
  })
  return NextResponse.json({ ok: true, id: String(doc._id) })
}
```

- [ ] **Step 2: Rewrite `components/contact-form.tsx` to POST**

```tsx
'use client'
import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

export function ContactForm({ propertySlug }: { propertySlug?: string }) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'), phone: fd.get('phone'), email: fd.get('email'),
          intent: (fd.get('intent') as string) || 'Buy', message: fd.get('message'), propertySlug,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Submit failed')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="rs-form-success">
        <CheckCircle2 size={40} strokeWidth={1.4} />
        <h4>Thank you for reaching out.</h4>
        <p>Our team will contact you shortly.</p>
      </div>
    )
  }

  return (
    <form className="rs-contact-form" onSubmit={onSubmit}>
      <input name="name" required type="text" placeholder="Full Name*" aria-label="Full name" minLength={2} />
      <input name="phone" required type="tel" placeholder="Mobile Number*" aria-label="Mobile number" pattern="[+\d][\d\s-]{7,15}" />
      <input name="email" type="email" placeholder="Email Address" aria-label="Email address" />
      <select name="intent" defaultValue="Buy" aria-label="I am looking to">
        <option value="Buy">Buy a property</option>
        <option value="Sell">Sell a property</option>
        <option value="Rent">Rent / Lease</option>
        <option value="Submit">Submit my property</option>
      </select>
      <textarea name="message" placeholder="Your Message" rows={4} aria-label="Your message" />
      {error && <p role="alert" style={{ color: '#b91c1c', fontSize: 13 }}>{error}</p>}
      <button type="submit" disabled={loading}>{loading ? 'SUBMITTING…' : 'SUBMIT NOW'}</button>
    </form>
  )
}
export default ContactForm
```

- [ ] **Step 3: Create `components/property-enquire.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { Phone } from 'lucide-react'
import { ContactForm } from './contact-form'

export function PropertyEnquire({ slug, name }: { slug: string; name: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button type="button" onClick={() => setOpen((o) => !o)} className="rs-aside-cta" aria-expanded={open} style={{ width: '100%', border: 0, cursor: 'pointer' }}>
        <Phone size={15} aria-hidden="true" /> Enquire Now
      </button>
      {open && (
        <div style={{ marginTop: 12 }} aria-label={`Enquire about ${name}`}>
          <ContactForm propertySlug={slug} />
        </div>
      )}
    </div>
  )
}
export default PropertyEnquire
```

- [ ] **Step 4: Modify `app/projects/[slug]/page.tsx:183-186`** — replace Link CTA with enquire form

Old:
```tsx
<Link href="/contact" className="rs-aside-cta">
  <Phone size={15} aria-hidden="true" /> Enquire Now
</Link>
```
New:
```tsx
<PropertyEnquire slug={property.slug} name={property.name} />
```
Also update imports: remove `Phone` if unused elsewhere, add `import PropertyEnquire from '@/components/property-enquire'`.

- [ ] **Step 5: Verify**

Run: `pnpm exec tsc --noEmit`
Expected: PASS. Manual: submit contact form → 200 (queued when no DB).

- [ ] **Step 6: Commit**

```bash
git add app/api/inquiries/route.ts components/contact-form.tsx components/property-enquire.tsx "app/projects/[slug]/page.tsx"
git commit -m "feat: inquiries api contact property cta"
```

---

### Task 5: Property CRUD APIs + Cloudinary sign + admin list/editor

**Files:**
- Create: `app/api/admin/properties/route.ts`
- Create: `app/api/admin/properties/[id]/route.ts`
- Create: `app/api/admin/sign-upload/route.ts`
- Create: `app/admin/layout.tsx`, `app/admin/page.tsx`
- Create: `app/admin/properties/page.tsx`
- Create: `app/admin/properties/[id]/page.tsx`
- Create: `components/admin/image-uploader.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Create `app/api/admin/properties/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { PropertyModel } from '@/models/Property'

async function authed() {
  const t = (await cookies()).get(ADMIN_COOKIE)?.value
  return !!t && (await verifyAdminToken(t).catch(() => false))
}

export async function GET(req: Request) {
  if (!(await authed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await dbConnect()
  const q = new URL(req.url).searchParams.get('q')?.toLowerCase() ?? ''
  const docs = await PropertyModel.find({}).sort({ updatedAt: -1 }).lean()
  const filtered = q ? docs.filter((d: Record<string, unknown>) => `${d.name} ${d.location} ${d.builder}`.toLowerCase().includes(q)) : docs
  return NextResponse.json({ items: filtered })
}

export async function POST(req: Request) {
  if (!(await authed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json()
  if (!b.slug || !b.name || !b.location) return NextResponse.json({ error: 'slug, name, location required.' }, { status: 400 })
  await dbConnect()
  const doc = await PropertyModel.create(b)
  return NextResponse.json({ ok: true, id: String(doc._id) })
}
```

- [ ] **Step 2: Create `app/api/admin/properties/[id]/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { PropertyModel } from '@/models/Property'

async function authed() {
  const t = (await cookies()).get(ADMIN_COOKIE)?.value
  return !!t && (await verifyAdminToken(t).catch(() => false))
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await dbConnect()
  const doc = await PropertyModel.findByIdAndUpdate(id, await req.json(), { new: true }).lean()
  if (!doc) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await dbConnect()
  await PropertyModel.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Create `app/api/admin/sign-upload/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { v2 as cloudinary } from 'cloudinary'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/auth'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: Request) {
  const t = (await cookies()).get(ADMIN_COOKIE)?.value
  if (!t || !(await verifyAdminToken(t).catch(() => false)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { folder } = (await req.json().catch(() => ({}))) as { folder?: string }
  const timestamp = Math.round(Date.now() / 1000)
  const safeFolder = `royal-space/${(folder ?? 'general').replace(/[^a-z0-9-]/gi, '')}`
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder: safeFolder }, process.env.CLOUDINARY_API_SECRET ?? '')
  return NextResponse.json({ signature, timestamp, folder: safeFolder, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME })
}
```

- [ ] **Step 4: Create `app/admin/layout.tsx` + `app/admin/page.tsx`**

```tsx
import Link from 'next/link'
import { Building2, Inbox, LogOut, Eye } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rs-admin">
      <aside className="rs-admin-side" aria-label="Admin navigation">
        <Link href="/admin/properties" className="rs-admin-brand">Royal Space · Admin</Link>
        <nav>
          <Link href="/admin/properties"><Building2 size={16} /> Properties</Link>
          <Link href="/admin/inquiries"><Inbox size={16} /> Inquiries</Link>
          <Link href="/" target="_blank"><Eye size={16} /> View site</Link>
        </nav>
        <form action="/api/admin/logout" method="post"><button type="submit"><LogOut size={16} /> Logout</button></form>
      </aside>
      <div className="rs-admin-main">{children}</div>
    </div>
  )
}
```

```tsx
import { redirect } from 'next/navigation'
export default function AdminIndex() {
  redirect('/admin/properties')
}
```

- [ ] **Step 5: Create list `app/admin/properties/page.tsx`** (search + table desktop / cards mobile, delete confirm, undo toast omitted v1 — confirm dialog only)

```tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

type Item = { _id: string; slug: string; name: string; location: string; priceDisplay: string; status: string; updatedAt: string }

export default function PropertiesAdmin() {
  const [items, setItems] = useState<Item[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  async function load(query = '') {
    setLoading(true)
    const res = await fetch(`/api/admin/properties?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    setItems(data.items ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function remove(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    await fetch(`/api/admin/properties/${id}`, { method: 'DELETE' })
    load(q)
  }

  return (
    <div>
      <div className="rs-admin-head">
        <h1>Properties</h1>
        <Link href="/admin/properties/new" className="rs-admin-primary"><Plus size={16} /> New Property</Link>
      </div>
      <form className="rs-admin-search" role="search" onSubmit={(e) => { e.preventDefault(); load(q) }}>
        <Search size={16} aria-hidden="true" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, location, builder…" aria-label="Search properties" />
        <button type="submit">Search</button>
      </form>
      {loading ? <p aria-live="polite">Loading…</p> : (
        <div className="rs-admin-tablewrap">
          <table className="rs-admin-table">
            <thead><tr><th>Name</th><th>Location</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td><td>{p.location}</td><td>{p.priceDisplay}</td><td>{p.status}</td>
                  <td><Link href={`/admin/properties/${p._id}`} aria-label={`Edit ${p.name}`}><Pencil size={16} /></Link>
                  <button type="button" onClick={() => remove(p._id, p.name)} aria-label={`Delete ${p.name}`}><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p aria-live="polite">{items.length} properties</p>
    </div>
  )
}
```

- [ ] **Step 6: Create `components/admin/image-uploader.tsx`** (signed direct upload)

```tsx
'use client'
import { useState } from 'react'
import { X, Star } from 'lucide-react'

export type Img = { public_id: string; secure_url: string; cover?: boolean }

export function ImageUploader({ slug, images, onChange }: { slug: string; images: Img[]; onChange: (v: Img[]) => void }) {
  const [busy, setBusy] = useState(false)
  async function upload(files: FileList | null) {
    if (!files?.length) return
    setBusy(true)
    try {
      const sign = await (await fetch('/api/admin/sign-upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folder: slug }) })).json()
      const next = [...images]
      for (const f of Array.from(files).slice(0, 10 - images.length)) {
        const fd = new FormData()
        fd.append('file', f)
        fd.append('api_key', sign.apiKey)
        fd.append('timestamp', String(sign.timestamp))
        fd.append('folder', sign.folder)
        fd.append('signature', sign.signature)
        const up = await (await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, { method: 'POST', body: fd })).json()
        next.push({ public_id: up.public_id, secure_url: up.secure_url, cover: next.length === 0 })
      }
      onChange(next)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div>
      <input type="file" accept="image/*" multiple onChange={(e) => upload(e.target.files)} aria-label="Upload property images" />
      {busy && <p aria-live="polite">Uploading…</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 10, marginTop: 10 }}>
        {images.map((img, i) => (
          <div key={img.public_id} style={{ position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_400/')} alt="" width={200} height={130} style={{ width: '100%', height: 90, objectFit: 'cover' }} loading="lazy" />
            <button type="button" onClick={() => onChange(images.map((x, j) => ({ ...x, cover: j === i })))} aria-label="Set cover"><Star size={14} /></button>
            <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} aria-label="Remove image"><X size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Create editor `app/admin/properties/[id]/page.tsx`** — `new` renders blank defaults; existing id fetches item, edits all scalar fields + dynamic configs/amenities/connectivity + images; Save POST (new) or PATCH (id). Full code ~120 lines: keep fields name/slug/builder/location/address/status/priceDisplay/areaDisplay/bhkDisplay/category + textarea overview (one per line) + config rows (bhk/area/price + add/remove) + amenities comma input + images. Error near field, focus first invalid via `id="f-name"` pattern.

- [ ] **Step 8: Append `.rs-admin` CSS to `app/globals.css`** — sidebar grid `250px 1fr` ≥1024px, stacked mobile; table `overflow-x-auto`; inputs min-height 44px; primary button uses `var(--rs-grad)`.

- [ ] **Step 9: Verify**

Run: `pnpm exec tsc --noEmit && pnpm build`
Expected: build succeeds. Manual: New → upload 1 image → save → appears in list.

- [ ] **Step 10: Commit**

```bash
git add app/api/admin/properties app/api/admin/sign-upload/route.ts app/admin components/admin/image-uploader.tsx app/globals.css
git commit -m "feat: property crud cloudinary admin ui"
```

---

### Task 6: Inquiries dashboard + verification

**Files:**
- Create: `app/api/admin/inquiries/route.ts`
- Create: `app/api/admin/inquiries/[id]/route.ts`
- Create: `app/admin/inquiries/page.tsx`

- [ ] **Step 1: Create `app/api/admin/inquiries/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { InquiryModel } from '@/models/Inquiry'

export async function GET(req: Request) {
  const t = (await cookies()).get(ADMIN_COOKIE)?.value
  if (!t || !(await verifyAdminToken(t).catch(() => false))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await dbConnect()
  const sp = new URL(req.url).searchParams
  const filter: Record<string, string> = {}
  if (sp.get('status')) filter.status = sp.get('status')!
  if (sp.get('source')) filter.source = sp.get('source')!
  const items = await InquiryModel.find(filter).sort({ createdAt: -1 }).limit(200).lean()
  const newCount = await InquiryModel.countDocuments({ status: 'new' })
  return NextResponse.json({ items, newCount })
}
```

- [ ] **Step 2: Create `app/api/admin/inquiries/[id]/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { InquiryModel } from '@/models/Inquiry'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const t = (await cookies()).get(ADMIN_COOKIE)?.value
  if (!t || !(await verifyAdminToken(t).catch(() => false))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await dbConnect()
  await InquiryModel.findByIdAndUpdate(id, await req.json())
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Create `app/admin/inquiries/page.tsx`** — KPI cards (New/Open from `newCount` + items length), filters status/source, table desktop + cards mobile, detail `<details>` drawer with `tel:`/`mailto:` links, status select PATCH, notes textarea PATCH. Loading skeleton text `aria-live`, empty state with reset, error with retry.

- [ ] **Step 4: Full verify**

Run: `pnpm exec tsc --noEmit && pnpm build`
Expected: success, no type errors. Manual responsive check: 375px cards no h-scroll, 1024px sidebar visible, keyboard tab order login→list→editor→inbox sane, `prefers-reduced-motion` no animation.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/inquiries app/admin/inquiries/page.tsx
git commit -m "feat: inquiries dashboard kpis inbox"
```

---

## Self-Review

- Spec coverage: login (Task 3), CRUD+Cloudinary (Task 5), inquiries inbox + both sources (Tasks 4+6), Atlas persist (Task 2), responsive/a11y tokens (Tasks 3/5/6 CSS). Covered.
- Placeholders: none — every step ships exact code/commands. Editor Task 5 Step 7 intentionally compact; implementer expands from listed fields using Step 5 list pattern.
- Type consistency: `Img {public_id,secure_url,cover}` shared between model, uploader, editor. `DbProperty._id: string`. Inquiry `status/source/intent` enums identical across model + APIs + UI.
