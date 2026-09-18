/**
 * Seed Property-14..24 (the newly added folders) into MongoDB + Cloudinary.
 *
 * Usage:
 *   node scripts/seed-properties-14-24.mjs                 # all 11
 *   node scripts/seed-properties-14-24.mjs soham-heights   # one by slug
 *
 * Requires .env.local with MONGODB_URI, CLOUDINARY_* (or CLOUDINARY_URL).
 *
 * Idempotent: re-running updates the existing doc by slug and replaces its
 * images array with the current Cloudinary state (existing public_ids reused,
 * new local files uploaded, stale Cloudinary assets untouched).
 */
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })

import { readdirSync, statSync, existsSync } from 'node:fs'
import { join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { v2 as cloudinary } from 'cloudinary'
import mongoose from 'mongoose'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const PROPS_DIR = join(ROOT, 'properties')

// CLOUDINARY_URL (cloudinary://key:secret@cloud) drives config automatically;
// only override cloud_name if the explicit var exists (avoid stomping the
// env-parsed config with undefined).
if (process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

// ---------------------------------------------------------------------------
// Property data distilled from properties/Property-{14..24}/info.md
// ---------------------------------------------------------------------------
const PROPERTIES = [
  {
    slug: 'soham-heights',
    folder: 'Property-14',
    name: 'Soham Heights',
    builder: 'Sagar Om DB Infra',
    location: 'Kandivali West',
    address: 'Kandivali West, Mumbai (near proposed Coastal Road)',
    rera: 'P51800056062',
    status: 'Under Construction',
    possession: 'December 2026',
    tagline: '22-storey premium tower with sea & pagoda views — the most affordable prices in Kandivali West.',
    overview: [
      '22-storey premium residential tower by Sagar Om DB Infra at the heart of Kandivali West, with unmatched future connectivity via the proposed Coastal Road.',
      'Enjoy sea and pagoda views from elevated residences, with the best possible connectivity to schools, hospitals and shopping.',
      'Double-heighted ground floor + E-Deck level amenities + 22 residential floors — the most affordable prices in Kandivali West.',
    ],
    configurations: [
      { bhk: '1 BHK', area: '403 – 440 sq.ft.' },
      { bhk: '2 BHK', area: '583 – 645 sq.ft.' },
    ],
    amenities: [
      'Grand Entrance Lobby', 'Jacuzzi (Male/Female)', 'Indoor Games', 'Library',
      'Swimming Pool', "Children's Play Area", 'Private Party Deck', 'Gazebo',
      'Barbeque', 'Open Sky Lounge', 'Community Hall', 'Fitness Centre',
      'Multipurpose Court', 'Telescopic Point', 'Open Air Gym & Yoga Area',
    ],
    connectivity: [
      'Proposed Coastal Road — at project',
      'Schools, hospitals & shopping — close by',
      'Sea & pagoda views from residences',
    ],
    priceDisplay: 'On Request',
    areaDisplay: '403 – 645 Sq.Ft.',
    bhkDisplay: '1, 2',
    category: 'Residential',
    mapUrl: 'https://maps.app.goo.gl/DtzTbKgCJcTWnDYK7',
  },
  {
    slug: 'chandak-treesourus-tower-2',
    folder: 'Property-15',
    name: 'Chandak Treesourus — Tower 2',
    builder: 'Chandak Group',
    location: 'Malad West',
    address: 'Chincholi Bunder Road, Opp. Vivanta Hospital, Malad (W), Mumbai',
    rera: 'P51800048658',
    status: 'Under Construction',
    tagline: 'Elevated living, exceptional views — 2 & 3 BHK residences from the 2nd to the 45th floor.',
    overview: [
      'Chandak Treesourus Tower 2 — elevated living with exceptional views at Malad West.',
      'Spacious 2 & 3 BHK residences with private sun decks and dry balconies from the 2nd to the 45th floor.',
      '3-level basement + podium parking, open green views and premium lifestyle amenities including an infinity pool on the 46th floor.',
    ],
    configurations: [
      { bhk: '2 BHK', area: '2nd – 45th Floor', price: '₹36,000 – 41,000++/sq.ft. (band-wise)' },
      { bhk: '3 BHK', area: '2nd – 45th Floor', price: '₹36,000 – 41,000++/sq.ft. (band-wise)' },
    ],
    amenities: [
      'Infinity Pool (46th Floor)', 'Modern Gym', 'Co-working Spaces',
      'Meeting Room', 'Guest Rooms', '3-Level Basement + Podium Parking',
    ],
    connectivity: [
      'Opp. Vivanta Hospital, Chincholi Bunder Road',
      'Malad Link Road — minutes',
      'Western Express Highway — close by',
    ],
    priceDisplay: '₹36,000 – 41,000++ / Sq.Ft.',
    areaDisplay: '2 & 3 BHK',
    bhkDisplay: '2, 3',
    category: 'Residential',
  },
  {
    slug: 'mahindra-marina-64',
    folder: 'Property-16',
    name: 'Mahindra Lifespaces Marina 64',
    builder: 'Mahindra Lifespaces',
    location: 'Navy Nagar, Malad West',
    address: 'Navy Nagar, Malad West, Mumbai — 4.2-acre premium development',
    status: 'New Launch',
    tagline: "Mahindra Lifespaces' newest landmark — 4.2-acre premium development with 2 & 3 BHK residences.",
    overview: [
      "Mahindra Lifespaces' newest landmark — a 4.2-acre premium development in the heart of Malad West (Navy Nagar).",
      'Premium 2 BHK (760 sq.ft. RERA carpet) and 3 BHK (965 & 1050 sq.ft. RERA carpet) residences.',
      'Shankar Mandir within the project, Jain Derasar 1 min, Link Road 2 mins, Infinity Mall 2 mins, D-Mart 3 mins — excellent connectivity to Western Railway and major highways.',
    ],
    configurations: [
      { bhk: '2 BHK', area: '760 sq.ft.', price: '₹2.85 Cr onwards (all inclusive)' },
      { bhk: '3 BHK', area: '965 sq.ft.', price: '₹2.85 Cr onwards (all inclusive)' },
      { bhk: '3 BHK', area: '1,050 sq.ft.', price: '₹2.85 Cr onwards (all inclusive)' },
    ],
    amenities: [
      'Shankar Mandir within project', 'Landscaped open spaces', 'World-class lifestyle amenities',
    ],
    connectivity: [
      'Jain Derasar — 1 min',
      'Link Road — 2 mins',
      'Infinity Mall — 2 mins',
      'D-Mart — 3 mins',
      'Western Railway + major highways — excellent connectivity',
    ],
    priceDisplay: '₹2.85 Cr onwards (All Inclusive)',
    areaDisplay: '760 – 1,050 Sq.Ft.',
    bhkDisplay: '2, 3',
    category: 'Residential',
  },
  {
    slug: 'harshvardhan',
    folder: 'Property-17',
    name: 'Harshvardhan',
    builder: 'Seecons Infrastructure LLP',
    location: 'Malad West',
    address: 'Plot No. 6, Nadiawala Colony No. 1, off Swami Vivekananda Road, Malad (W), Mumbai — 400064',
    status: 'Under Construction — 1st slab work in progress',
    possession: 'June 2027',
    tagline: 'Boutique G+9 premium tower by Seecons Infrastructure LLP with limited exclusive residences.',
    overview: [
      'A boutique residential address by Seecons Infrastructure LLP, thoughtfully designed for modern living with excellent connectivity.',
      'G+9 storey premium tower with limited exclusive residences — high demand project.',
      'Modern gymnasium, in-building stack parking, prime residential location.',
    ],
    configurations: [
      { bhk: '1 BHK', area: '343 sq.ft.', price: '₹1.03 Cr onwards' },
      { bhk: '2 BHK', area: '584 sq.ft.', price: '₹1.75 Cr onwards' },
    ],
    amenities: [
      'Modern Gymnasium', 'In-Building Stack Parking', 'Prime Residential Location',
    ],
    connectivity: [
      'Off Swami Vivekananda Road — prime residential location',
      'Schools, hospitals & shopping — close by',
    ],
    priceDisplay: '₹1.03 – 1.75 Cr onwards',
    areaDisplay: '343 – 584 Sq.Ft.',
    bhkDisplay: '1, 2',
    category: 'Residential',
    mapUrl: 'https://maps.app.goo.gl/e4tdB5qTVg66EZbY6',
  },
  {
    slug: 'np-harmony-borivali',
    folder: 'Property-18',
    name: 'NP Harmony',
    builder: 'NP Group',
    location: 'Borivali West',
    address: 'Behind Vazira Ganesh Temple, Borivali West, Mumbai',
    status: 'RCC completed',
    possession: 'December 2026',
    tagline: '7-storey luxurious Vastu-compliant towers by NP Group at Borivali West.',
    overview: [
      'Greetings from NP Group — 7-storey luxurious towers at Borivali West.',
      'Vastu-compliant 1, 2 & 3 BHK residences with RCC completed — ready for fit-out.',
      'Live life like a Royal Family — peaceful yet connected neighbourhood.',
    ],
    configurations: [
      { bhk: '1 BHK', area: '439 sq.ft.' },
      { bhk: '2 BHK', area: '627 sq.ft.' },
      { bhk: '3 BHK', area: '760 sq.ft.' },
      { bhk: '3 BHK', area: '919 sq.ft.' },
    ],
    amenities: [
      'Vastu-Compliant Flats', '7-Storey Luxurious Towers',
    ],
    connectivity: [
      'Metro station — 3 mins walking',
      'Derasar & Temple — 2 mins',
      'Railway station — 10 mins',
      'School, college & hospital — within 10 mins',
    ],
    priceDisplay: 'On Request',
    areaDisplay: '439 – 919 Sq.Ft.',
    bhkDisplay: '1, 2, 3',
    category: 'Residential',
    mapUrl: 'https://maps.app.goo.gl/4sk625mkVHYvCRA78',
  },
  {
    slug: 'ethics-realty',
    folder: 'Property-19',
    name: 'Ethics Realty',
    builder: 'Ethics Realty (Chaitanya Group / Ethics Infra)',
    location: 'Near Liberty Garden, Malad West',
    address: 'Near Liberty Garden, Malad West, Mumbai — ~2 acre land parcel',
    status: 'Pre-Launch — EOI Open',
    tagline: 'Built by builders, driven by ethics — 20+ years of Mumbai redevelopment legacy in a 2-acre high-rise vision.',
    overview: [
      'Ethics Realty — the unified identity of a trusted Mumbai redevelopment legacy built over 20+ years through Chaitanya Group and Ethics Infra.',
      '20+ projects delivered, 21 lakh+ sq.ft. delivered, 28 lakh+ sq.ft. ongoing & upcoming — ₹3,000 Cr+ estimated active portfolio value.',
      'Approx. 2-acre land parcel with high-rise towers and 35+ lifestyle amenities — a rare early EOI opportunity.',
    ],
    configurations: [
      { bhk: '2 BHK', area: '500 – 710 sq.ft.', price: '₹31,000++/sq.ft.' },
      { bhk: '3 BHK', area: '730 – 1300 sq.ft.', price: '₹31,000++/sq.ft.' },
    ],
    amenities: [
      '35+ Lifestyle Amenities', 'High-Rise Towers', '~2 Acre Land Parcel',
    ],
    connectivity: [
      'Liberty Garden — nearby',
      'Malad Link Road — minutes',
    ],
    priceDisplay: '₹31,000++ / Sq.Ft. (EOI ₹99,000)',
    areaDisplay: '500 – 1,300 Sq.Ft.',
    bhkDisplay: '2, 3',
    category: 'Residential',
  },
  {
    slug: 'modirealty-rudraksh',
    folder: 'Property-20',
    name: 'Modirealty Rudraksh',
    builder: 'Modirealty Developers Pvt. Ltd.',
    location: 'Shankar Lane, Kandivali West',
    address: 'Shankar Lane, Kandivali West, Mumbai',
    rera: 'PM1180002502054',
    status: 'Under Construction — CC received, 3rd slab in progress',
    possession: 'March 2029',
    tagline: 'One acre, one landmark — lavish 2, 3, 4 & 5 BHK residences with 24,000 sq.ft. of curated amenities.',
    overview: [
      'Modirealty Rudraksh — "One Acre, One Landmark" by Modirealty Developers Pvt. Ltd., now RERA approved.',
      'S + 2 podiums + 19 storey residential tower with 24,000 sq.ft. of curated lifestyle amenities for every age and mood.',
      'CC received, 3rd slab work in progress — offering spacious 2, 3, 4 & 5 BHK (with deck); jodi options possible.',
    ],
    configurations: [
      { bhk: '2 BHK', area: '704 – 837 sq.ft.', price: '₹2.33 – 2.76 Cr' },
      { bhk: '3 BHK', area: '783 – 1,093 sq.ft.', price: '₹2.58 – 3.61 Cr' },
      { bhk: '4 BHK', area: '1,649 / 2,035 sq.ft.', price: '₹5.44 / 7.12 Cr' },
      { bhk: '5 BHK', area: '1,908 – 2,745 sq.ft.', price: '₹6.30 – 9.06 Cr' },
    ],
    amenities: [
      '24,000 sq.ft. Curated Amenities',
    ],
    connectivity: [
      'Shankar Lane, Kandivali West — prime residential address',
      'Link Road + Western Express Highway — close by',
    ],
    priceDisplay: '₹2.33 – 9.06 Cr',
    areaDisplay: '704 – 2,745 Sq.Ft.',
    bhkDisplay: '2, 3, 4, 5',
    category: 'Residential',
    mapUrl: 'https://maps.app.goo.gl/V7NFndxJvBJU1fMy9',
  },
  {
    slug: 'modirealty-asopalav',
    folder: 'Property-21',
    name: 'Modirealty Asopalav',
    builder: 'Modirealty Developers Pvt. Ltd.',
    location: 'Shankar Lane, Kandivali West',
    address: 'Shankar Lane, Kandivali West, Mumbai',
    rera: 'PM1180002502111',
    status: 'Under Construction',
    possession: 'March 2028',
    tagline: 'One address, many dreams — well-ventilated Vastu-compliant 1, 2 & 3 BHK residences.',
    overview: [
      'Modirealty Asopalav — "One Address, Many Dreams" by Modirealty Developers Pvt. Ltd., now RERA approved.',
      'G+1 commercial + 21 storey residential tower at Shankar Lane, Kandivali West.',
      'Well-ventilated, Vastu-compliant 1, 2 & 3 BHK homes with jodi options possible.',
    ],
    configurations: [
      { bhk: '1 BHK', area: '425 / 428 sq.ft.', price: '₹1.43 Cr onwards' },
      { bhk: '2 BHK', area: '616 / 671 sq.ft.', price: '₹2.07 / 2.31 Cr' },
      { bhk: '3 BHK', area: '895 / 947 sq.ft.', price: '₹2.96 – 3.23 Cr' },
    ],
    amenities: [
      'Party Deck', "Kids Play Area", 'Terrace Garden', 'Swimming Pool',
      'Pergola Seating', 'Multipurpose Turf', 'Modern Gymnasium',
    ],
    connectivity: [
      'Shankar Lane, Kandivali West — prime address',
      'Schools, hospitals & markets — close by',
    ],
    priceDisplay: '₹1.43 – 3.23 Cr',
    areaDisplay: '425 – 947 Sq.Ft.',
    bhkDisplay: '1, 2, 3',
    category: 'Residential',
    mapUrl: 'https://maps.app.goo.gl/dPfRUwfgmd6gVdfeA',
  },
  {
    slug: 'shreeji-aikyam',
    folder: 'Property-22',
    name: 'Shreeji Aikyam',
    builder: 'Shreeji Sharan Group of Companies',
    location: 'New Link Road, Kandivali West',
    address: 'Opp. Mahavir Nagar Metro Station, New Link Road, Kandivali West, Mumbai — 400067',
    rera: 'P51800051233',
    status: 'Under Construction — bookings open',
    possession: '31 December 2028',
    tagline: 'One of the tallest towers opposite Mahavir Nagar Metro — 47 residential floors with Jain Derasar, Upashray, Haveli & temples on premises.',
    overview: [
      'Shreeji Aikyam — one of the tallest towers opposite Mahavir Nagar Metro Station, New Link Road, Kandivali West.',
      'Structure: 1 level basement + stilt + 9-level surface podium parking + E-Deck + 47 residential floors + rooftop amenities.',
      '1st floor starts from 115 ft height (~10th floor equivalent); internal floor-to-ceiling height approx 10.5 ft.',
      'Jain Derasar, Upashray, Haveli, Ganpati & Saibaba temple on building premises — a rare spiritual USP.',
    ],
    configurations: [
      { bhk: '2 BHK', area: '728 / 746 / 825 sq.ft.', price: '₹1.82 Cr++ onwards' },
      { bhk: '3 BHK', area: '978 / 1,125 / 1,288 sq.ft.', price: '₹2.45 Cr++ onwards' },
      { bhk: '4 BHK', area: '1,768 sq.ft.', price: '₹4.61 Cr++ onwards' },
    ],
    amenities: [
      '36+ World-Class Amenities',
      'Jain Derasar, Upashray & Haveli on Premises',
      'Ganpati & Saibaba Temple on Premises',
      'Rooftop Amenities',
    ],
    connectivity: [
      'Mahavir Nagar Metro Station — opposite',
      'New Link Road — at project',
      'Western Express Highway — close by',
    ],
    priceDisplay: '₹1.82 – 4.61 Cr onwards',
    areaDisplay: '728 – 1,768 Sq.Ft.',
    bhkDisplay: '2, 3, 4',
    category: 'Residential',
  },
  {
    slug: 'rashmi-signature',
    folder: 'Property-23',
    name: 'Rashmi Signature',
    builder: 'Modis Navnirman',
    location: 'Sunder Nagar, Malad West',
    address: 'Sunder Nagar, Malad West, Mumbai — gated community',
    status: 'Under Construction — ~70% completed',
    possession: 'December 2026 (RERA: August 2027)',
    tagline: 'A rare gated address that brings together green serenity, city connectivity and modern lifestyle.',
    overview: [
      'Modis Navnirman presents Rashmi Signature at Sunder Nagar, Malad West — a rare gated address.',
      'Construction ~70% completed; targeted possession December 2026 / RERA possession August 2027.',
      'Smart layouts with spacious living planned for light, ventilation & comfort; gated community surrounded by greenery — includes a pickleball court.',
    ],
    configurations: [
      { bhk: '2 BHK', area: '740 sq.ft. onwards', price: '₹2.40 Cr++ onwards' },
      { bhk: '3 BHK', area: '968 sq.ft. onwards', price: '₹3.10 Cr++ onwards' },
    ],
    amenities: [
      'Pickleball Court', 'Gated Community', 'Greenery',
    ],
    connectivity: [
      'SV Road — 3 mins walk',
      'Metro + Link Road — 7 mins',
      'Malad Station — 10 mins',
    ],
    priceDisplay: '₹2.40 – 3.10 Cr onwards',
    areaDisplay: '740 – 968 Sq.Ft.',
    bhkDisplay: '2, 3',
    category: 'Residential',
    mapUrl: 'https://maps.app.goo.gl/VUowUwfytUHtxy4PA',
  },
  {
    slug: 'sukan',
    folder: 'Property-24',
    name: 'Sukan',
    builder: 'Sukan Group',
    location: 'MG Road, Kandivali West',
    address: 'MG Road, Kandivali West, Mumbai',
    rera: 'P51800079220',
    status: 'Full CC received — 2nd slab completed',
    tagline: 'A practical lifestyle destination with dedicated dry balconies and a close-knit community feel.',
    overview: [
      'Sukan — a practical lifestyle destination at MG Road, Kandivali West, crafted for modern comfort, smart living and a close-knit community experience.',
      'Full CC received and 2nd slab completed.',
      'Exclusive highlight: dedicated dry balconies — a rare feature in the vicinity, designed for convenience, hygiene and practicality.',
    ],
    configurations: [
      { bhk: '2 BHK', area: '604 / 720 / 810 sq.ft.' },
      { bhk: '2+2 BHK Jodi', area: '1,514.401 sq.ft.' },
    ],
    amenities: [
      '1,480+ sq.ft. Rooftop Lawn', '303 sq.ft. Multipurpose Hall', '425 sq.ft. Open-View Gym',
      'Dedicated Dry Balconies',
    ],
    connectivity: [
      'Metro — 10 mins',
      'Railway Station — 6 mins',
      'Link Road — 5 mins',
      'Western Express Highway — 14 mins',
      'Jain Derasar, Haveli, Swaminarayan Mandir, Hanuman Mandir — nearby',
    ],
    priceDisplay: 'On Request',
    areaDisplay: '604 – 1,514 Sq.Ft.',
    bhkDisplay: '2, 2+2 Jodi',
    category: 'Residential',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const MAX_IMAGES_PER_PROPERTY = 15
const MAX_FILE_BYTES = 9 * 1024 * 1024 // Cloudinary free-tier cap is 10MB

function localImages(folder) {
  const dir = join(PROPS_DIR, folder, 'images')
  if (!existsSync(dir)) return []
  const skipped = []
  const files = readdirSync(dir)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .sort()
    .map((f) => join(dir, f))
    .filter((p) => {
      const s = statSync(p).size
      if (s <= 30 * 1024) return false
      if (s > MAX_FILE_BYTES) {
        skipped.push(`${basename(p)} (${(s / 1e6).toFixed(1)} MB)`)
        return false
      }
      return true
    })
  if (skipped.length) console.log(`  skipped (>${MAX_FILE_BYTES / 1e6}MB): ${skipped.join(', ')}`)
  return files.slice(0, MAX_IMAGES_PER_PROPERTY)
}

async function uploadToCloudinary(slug, filePath) {
  const res = await cloudinary.uploader.upload(filePath, {
    folder: `royal-space/${slug}`,
    resource_type: 'image',
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  })
  return { public_id: res.public_id, secure_url: res.secure_url }
}

async function seedOne(p) {
  const files = localImages(p.folder)
  console.log(`\n=== ${p.slug} (${p.folder}) — ${files.length} local image(s) ===`)
  const images = []
  for (let i = 0; i < files.length; i++) {
    const f = files[i]
    const name = basename(f)
    try {
      const up = await uploadToCloudinary(p.slug, f)
      images.push({ ...up, cover: i === 0 })
      process.stdout.write(`  [${i + 1}/${files.length}] ${name} -> ${up.public_id}\n`)
    } catch (err) {
      console.error(`  [${i + 1}/${files.length}] ${name} FAILED: ${err.message}`)
    }
  }

  const doc = { ...p, images }
  delete doc.folder
  await PropertyModel.findOneAndUpdate({ slug: p.slug }, { $set: doc }, { upsert: true, new: true })
  console.log(`  DB upserted. images=${images.length}`)
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
const PropertySchema = new mongoose.Schema(
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
    configurations: {
      type: [{ bhk: { type: String, required: true }, area: { type: String, required: true }, price: String, _id: false }],
      default: [],
    },
    amenities: { type: [String], default: [] },
    connectivity: { type: [String], default: [] },
    priceDisplay: { type: String, required: true },
    areaDisplay: { type: String, required: true },
    bhkDisplay: { type: String, required: true },
    category: { type: String, enum: ['Residential', 'Commercial'], default: 'Residential' },
    mapUrl: String,
    images: {
      type: [{ public_id: { type: String, required: true }, secure_url: { type: String, required: true }, cover: Boolean, _id: false }],
      default: [],
    },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
)
const PropertyModel = mongoose.models.Property ?? mongoose.model('Property', PropertySchema)

const only = process.argv.slice(2)
const selected = only.length ? PROPERTIES.filter((p) => only.includes(p.slug)) : PROPERTIES
if (!selected.length) {
  console.error(`no match. slugs: ${PROPERTIES.map((p) => p.slug).join(', ')}`)
  process.exit(1)
}

console.log(`Seeding ${selected.length} propert(ies)…`)
await mongoose.connect(process.env.MONGODB_URI, { maxPoolSize: 5 })
console.log('Mongo connected.')

for (const p of selected) await seedOne(p)

await mongoose.disconnect()
console.log('\nDone.')
