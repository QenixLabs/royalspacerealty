export type Project = {
  name: string
  location: string
  price: string
  area: string
  bedrooms: string
  image: string
  category: 'Residential' | 'Commercial'
}

export const projects: Project[] = [
  {
    name: 'ROYAL CREST',
    location: 'Goregaon (West)',
    price: '₹ 2.61 Cr - ₹ 4.31 Cr',
    area: '746 Sq.Ft. - 1234 Sq.Ft.',
    bedrooms: '2, 3',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80',
    category: 'Residential',
  },
  {
    name: 'Windermere',
    location: 'Bhayandarpada',
    price: '₹ 1.15 Cr - ₹ 1.55 Cr',
    area: '548 Sq.Ft. - 758 Sq.Ft.',
    bedrooms: '1, 2',
    image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80',
    category: 'Residential',
  },
  {
    name: 'ROYAL VALORA',
    location: 'Bandra (East)',
    price: '₹ 5.97 Cr - ₹ 11.94 Cr',
    area: '1360 Sq.Ft. - 2737 Sq.Ft.',
    bedrooms: '3, 4, 5',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
    category: 'Residential',
  },
  {
    name: 'Shrisat One',
    location: 'Dindoshi-Goregaon (E)',
    price: '₹ 1.67 Cr - ₹ 4.26 Cr',
    area: '446 Sq.Ft. - 1210 Sq.Ft.',
    bedrooms: '1, 2, 3',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
    category: 'Residential',
  },
  {
    name: 'Osha One Borivali',
    location: 'Borivali (West)',
    price: '₹ 2.30 Cr - ₹ 3.07 Cr',
    area: '645 Sq.Ft. - 870 Sq.Ft.',
    bedrooms: '2, 3',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80',
    category: 'Residential',
  },
  {
    name: 'BHOOMI AER',
    location: 'Borivali (West)',
    price: '₹ 4.04 Cr - ₹ 12.29 Cr',
    area: '1009 Sq.Ft. - 3073 Sq.Ft.',
    bedrooms: '2, 3, 5',
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=900&q=80',
    category: 'Residential',
  },
  {
    name: 'AGAMI LEGENDS',
    location: 'Bandra (East)',
    price: '₹ 7.53 Cr - ₹ 10.85 Cr',
    area: '1307 Sq.Ft. - 1835 Sq.Ft.',
    bedrooms: '3, 4',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=80',
    category: 'Residential',
  },
  {
    name: 'Trade Square',
    location: 'Andheri (East)',
    price: '₹ 1.90 Cr - ₹ 3.40 Cr',
    area: '420 Sq.Ft. - 780 Sq.Ft.',
    bedrooms: 'Office',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
    category: 'Commercial',
  },
  {
    name: 'Hubtown Solaris',
    location: 'Powai',
    price: '₹ 2.75 Cr - ₹ 5.20 Cr',
    area: '610 Sq.Ft. - 1150 Sq.Ft.',
    bedrooms: 'Office',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
    category: 'Commercial',
  },
]
