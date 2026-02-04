# Admin System Quick Reference

## 📍 Essential Documents

- **[ADMIN-STATUS.md](ADMIN-STATUS.md)** - Current status, tech stack, what's built
- **[ROADMAP.md](ROADMAP.md)** - Future features and world-class vision
- **[admin-quick-start.md](admin-quick-start.md)** - Getting started guide

## 🚀 Quick Commands

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build            # Production build
npm run preview          # Preview production build

# Database
# Run supabase-schema.sql in Supabase SQL Editor
# Run migration-fix-schema.sql to update schema
```

## 🔑 Admin Routes

| Route | Purpose | Access |
|-------|---------|--------|
| `/admin/login` | Login page | Public |
| `/admin/dashboard` | Dashboard | All authenticated |
| `/admin/events` | Events management | Editor+ |
| `/admin/content/programs` | Programs | Editor+ |
| `/admin/site-settings` | Site settings | Admin+ |
| `/admin/content` | Content hub | Editor+ |
| `/admin/content/hero` | Hero slides | Editor+ |
| `/admin/content/stories` | Stories | Editor+ |
| `/admin/content/impact` | Impact metrics | Editor+ |
| `/admin/content/board` | Board members | Admin+ |
| `/admin/users` | User management | Super Admin |
| `/admin/settings` | Admin settings | Admin+ |

## 🛠️ Tech Stack

- React 19 + TypeScript
- Vite 7.2.7
- Tailwind CSS
- Supabase (Auth + Database)
- Tiptap (Rich text)
- React Router v6
- date-fns

## ⚡ Common Tasks

### Create New Admin User
```sql
-- In Supabase SQL Editor
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'user@example.com';
```

### Fix Slow Page Loads
```sql
-- Run migration-fix-schema.sql in Supabase
-- Then hard refresh browser (Cmd+Shift+R)
```

### Add New Content Type
1. Create type in `src/admin/types/content.ts`
2. Create hook in `src/admin/hooks/useYourContent.ts`
3. Create page in `src/admin/pages/content/YourContentPage.tsx`
4. Add route in `src/App.tsx`
5. Add card to `ContentPage.tsx`

## 📊 Performance

- Build time: ~60 seconds
- Page load: < 1 second
- Bundle size: 883 KB (main)
- TypeScript errors: 0

## 🐛 Troubleshooting

**Pages load slowly?**
→ Run `migration-fix-schema.sql`

**TypeScript errors?**
→ Check `src/admin/types/content.ts` matches database

**Build fails?**
→ Run `npm install` and clear cache

**Can't login?**
→ Check Supabase credentials in `.env.local`

## 📞 Support

- Check [ADMIN-STATUS.md](ADMIN-STATUS.md) for current state
- See [ROADMAP.md](ROADMAP.md) for future plans
- Review database schema in `supabase-schema.sql`
