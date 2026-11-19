/**
 * დემო მონაცემები — პროფილი, ორგანიზაცია და აქტიური განცხადებები,
 * რომ ინტერფეისი ცარიელი არ იყოს და Meilisearch-ის ინდექსიც ამოქმედდეს.
 * გაშვება: npx tsx scripts/seed-demo.ts
 */
import { createAdminClient } from '../src/lib/supabase/admin';
import { ensureIndex, indexListings, toDocument } from '../src/lib/search/meilisearch';

const DEMO = [
  { t: { ka: 'ცემენტი M400, 50 კგ', en: 'Cement M400, 50 kg' }, type: 'material',
    cat: '11111111-1111-1111-1111-111111111101', price: 24, loc: 'თბილისი', brand: 'Heidelberg' },
  { t: { ka: 'აგური წითელი, სრული', en: 'Red brick, solid' }, type: 'material',
    cat: '11111111-1111-1111-1111-111111111101', price: 0.85, loc: 'თბილისი', brand: 'Tbilisi Brick' },
  { t: { ka: 'ხე-ტყე 50x150, ფიჭვი', en: 'Timber 50x150, pine' }, type: 'material',
    cat: '11111111-1111-1111-1111-111111111101', price: 620, loc: 'ბათუმი', brand: null },
  { t: { ka: 'ლამინატი AC4, 8 მმ', en: 'Laminate AC4, 8 mm' }, type: 'material',
    cat: '11111111-1111-1111-1111-111111111102', price: 32, loc: 'თბილისი', brand: 'Kronospan' },
  { t: { ka: 'საღებავი ინტერიერისთვის, 15 ლ', en: 'Interior paint, 15 L' }, type: 'material',
    cat: '11111111-1111-1111-1111-111111111102', price: 145, loc: 'ქუთაისი', brand: 'Caparol' },
  { t: { ka: 'ფილები კერამიკული 60x60', en: 'Ceramic tiles 60x60' }, type: 'material',
    cat: '11111111-1111-1111-1111-111111111102', price: 41, loc: 'თბილისი', brand: null },
  { t: { ka: 'პერფორატორი SDS-Plus', en: 'Rotary hammer SDS-Plus' }, type: 'material',
    cat: '11111111-1111-1111-1111-111111111103', price: 480, loc: 'თბილისი', brand: 'Bosch' },
  { t: { ka: 'სანტექნიკური მილები PPR', en: 'PPR plumbing pipes' }, type: 'material',
    cat: '11111111-1111-1111-1111-111111111104', price: 3.2, loc: 'რუსთავი', brand: null },
  { t: { ka: 'საკაბელო კვების ხაზი VVG', en: 'Power cable VVG' }, type: 'material',
    cat: '11111111-1111-1111-1111-111111111105', price: 2.4, loc: 'თბილისი', brand: null },
  { t: { ka: 'სახურავის მოწყობა', en: 'Roof installation' }, type: 'service',
    cat: '11111111-1111-1111-1111-111111111201', price: null, loc: 'თბილისი', brand: null },
  { t: { ka: 'ბინის კოსმეტიკური რემონტი', en: 'Apartment cosmetic renovation' }, type: 'service',
    cat: '11111111-1111-1111-1111-111111111202', price: 45, loc: 'თბილისი', brand: null },
  { t: { ka: 'არქიტექტურული პროექტირება', en: 'Architectural design' }, type: 'service',
    cat: '11111111-1111-1111-1111-111111111203', price: 35, loc: 'ბათუმი', brand: null },
  { t: { ka: 'მასალების ტრანსპორტირება', en: 'Material transport' }, type: 'service',
    cat: '11111111-1111-1111-1111-111111111204', price: 1.8, loc: 'თბილისი', brand: null },
];

const CAT_NAMES: Record<string, string> = {
  '11111111-1111-1111-1111-111111111101': 'building-materials',
  '11111111-1111-1111-1111-111111111102': 'finishing',
  '11111111-1111-1111-1111-111111111103': 'tools',
  '11111111-1111-1111-1111-111111111104': 'plumbing',
  '11111111-1111-1111-1111-111111111105': 'electrical',
  '11111111-1111-1111-1111-111111111201': 'construction',
  '11111111-1111-1111-1111-111111111202': 'renovation',
  '11111111-1111-1111-1111-111111111203': 'design',
  '11111111-1111-1111-1111-111111111204': 'transport',
};

async function main() {
  const admin = createAdminClient();

  const { data: users } = await admin.from('users').select('id').limit(1);
  const owner = users?.[0]?.id;
  if (!owner) {
    console.error('✗ მომხმარებელი არ არის. ჯერ დარეგისტრირდით ინტერფეისიდან.');
    process.exit(1);
  }

  const rows = DEMO.map((d, i) => ({
    owner_id: owner,
    type: d.type,
    category_id: d.cat,
    title: d.t,
    description: {
      ka: `${d.t.ka} — ხარისხიანი პროდუქტი, მიწოდება თბილისსა და რეგიონებში.`,
      en: `${d.t.en} — quality product with delivery.`,
    },
    brand: d.brand,
    price: d.price,
    price_on_request: d.price === null,
    currency: 'GEL',
    location: d.loc,
    attributes: d.type === 'service'
      ? { priceModel: d.price === null ? 'negotiable' : 'day', workRadiusKm: 40 }
      : { unit: 'piece', stock: 100 + i },
    status: 'active',
    package_code: 'extended',
    published_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
    views: Math.floor(Math.random() * 400),
    chats_count: Math.floor(Math.random() * 12),
  }));

  const { data: inserted, error } = await admin.from('listings')
    .insert(rows).select('id, type, category_id, title, description, brand, price, currency, location, status, published_at, expires_at');

  if (error) { console.error('✗ ჩაწერა ვერ მოხერხდა:', error.message); process.exit(1); }
  console.log(`✓ ${inserted.length} დემო განცხადება დაემატა`);

  await ensureIndex();
  await indexListings(inserted.map((r) => toDocument({
    id: r.id,
    type: r.type as 'material' | 'service',
    category_id: r.category_id,
    category_path: [CAT_NAMES[r.category_id] ?? ''],
    title: r.title as Record<string, string>,
    description: r.description as Record<string, string>,
    brand: r.brand,
    company_name: 'დემო მომწოდებელი',
    price: r.price === null ? null : Number(r.price),
    currency: r.currency,
    location: r.location,
    verified: true,
    rating_avg: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
    available_now: true,
    status: r.status,
    published_at: r.published_at,
    expires_at: r.expires_at,
  })));

  await new Promise((r) => setTimeout(r, 1500));
  console.log('✓ ინდექსი განახლდა — კატალოგი უნდა გამოჩნდეს');
}

main().catch((e) => { console.error('✗', e.message); process.exit(1); });
