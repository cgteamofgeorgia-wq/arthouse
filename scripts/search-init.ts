/** ინდექსის აწყობა და სრული ბექფილი — გაშვება: npm run search:init */
import { ensureIndex, indexListings, toDocument, searchListings } from '../src/lib/search/meilisearch';
import { createAdminClient } from '../src/lib/supabase/admin';

async function main() {
  console.log('→ ინდექსის პარამეტრები...');
  await ensureIndex();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('listings')
    .select(`
      id, type, category_id, title, description, brand, price, currency, location,
      lat, lng, status, published_at, expires_at,
      categories (slug, parent_id),
      organizations (name, verified),
      profiles:owner_id (rating_avg)
    `)
    .eq('status', 'active')
    .is('deleted_at', null);

  if (error) throw new Error(error.message);

  const docs = (data ?? []).map((row) => {
    const category = row.categories as { slug: string; parent_id: string | null } | null;
    const org = row.organizations as { name: string; verified: boolean } | null;
    const owner = row.profiles as { rating_avg: number } | null;
    return toDocument({
      id: row.id,
      type: row.type as 'material' | 'service',
      category_id: row.category_id,
      category_path: category ? [category.slug, ...(category.parent_id ? [category.parent_id] : [])] : [],
      title: row.title as Record<string, string>,
      description: (row.description ?? {}) as Record<string, string>,
      brand: row.brand,
      company_name: org?.name ?? null,
      price: row.price === null ? null : Number(row.price),
      currency: row.currency,
      location: row.location,
      lat: row.lat === null ? null : Number(row.lat),
      lng: row.lng === null ? null : Number(row.lng),
      verified: Boolean(org?.verified),
      rating_avg: Number(owner?.rating_avg ?? 0),
      available_now: true,
      status: row.status,
      published_at: row.published_at,
      expires_at: row.expires_at,
    });
  });

  console.log(`→ ${docs.length} განცხადების ინდექსირება...`);
  await indexListings(docs);

  await new Promise((r) => setTimeout(r, 1500));    // ინდექსის განახლებას დრო სჭირდება

  const check = await searchListings({ q: '', perPage: 1 });
  console.log(`✓ ინდექსშია: ${check.total} დოკუმენტი`);
}

main().catch((err) => {
  console.error('✗ ვერ შესრულდა:', err.message);
  process.exit(1);
});
