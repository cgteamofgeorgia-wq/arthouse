#!/usr/bin/env bash
# BuildHub — ლოკალური გაშვება ერთი ბრძანებით.
# გაშვება: bash start.sh

set -e

if [ ! -f package.json ]; then
  echo "✗ გაუშვით ეს სკრიპტი პროექტის ფესვიდან (სადაც package.json არის)"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "✗ Node.js ვერ მოიძებნა. დააყენეთ Node 22 ან უფრო ახალი: https://nodejs.org"
  exit 1
fi

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "✗ Node $NODE_MAJOR ძველია. საჭიროა Node 22+."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "→ დამოკიდებულებების დაყენება (npm ci)..."
  npm ci
fi

if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo ""
  echo "⚠ შეიქმნა .env.local — შეავსეთ Supabase-ის გასაღებები და გაუშვით ხელახლა."
  echo "  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY"
  echo ""
  exit 0
fi

if grep -q "xxxx.supabase.co" .env.local 2>/dev/null; then
  echo "⚠ .env.local-ში Supabase-ის მისამართი ჯერ სატესტო მნიშვნელობაა."
  echo "  შეავსეთ რეალური გასაღებები და გაუშვით ხელახლა."
  exit 1
fi

echo ""
echo "→ სერვერი ირთვება: http://localhost:3000"
echo "→ ტესტერი:        http://localhost:3000/test.html"
echo ""

npm run dev
