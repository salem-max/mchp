# Integrations Feature — Quick Start

## What was built

A phone-based integration UI scaffold that demonstrates how users could connect external platforms (WhatsApp, Telegram, TikTok, Facebook) using only their mobile number — no OAuth flows required.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  User verifies phone → Backend resolves platform identity   │
│  ↓                                                           │
│  WhatsApp: Business API check                               │
│  Telegram: Bot API + contact matching                       │
│  TikTok: CRM mapping (no API)                               │
│  Facebook: Graph API identity matching                      │
└─────────────────────────────────────────────────────────────┘
```

### Files created

**Database** (`prisma/schema.prisma`):
- Phone verification & integration status storage are implemented in code via Prisma models, but the current repo snapshot may differ from the originally documented schema.

Update note: the existing Prisma schema in this repo does **not** currently include `PhoneVerification`, `Integration`, `IntegrationPlatform`, or `IntegrationStatus` enums in `prisma/schema.prisma`.


**Services** (`lib/integrations/`):
- `phone-identity.ts` — normalize, validate, OTP generation/verification
- `platform-link.ts` — platform resolvers + sync/disconnect logic

**Frontend API usage** (`app/(dashboard)/customer/integrations/page.tsx`):
- `POST /api/user/phone` — send/verify OTP
- `GET /api/integrations` — fetch verified phone and platform statuses
- `POST /api/integrations/sync` — sync one or all platforms
- `POST /api/integrations/disconnect/[platform]` — disconnect
- `GET /api/integrations/status` — lightweight status summary

> Note: the backend route implementations for `/api/integrations/*` are now available in `app/api/integrations`.

**UI** (`app/(dashboard)/customer/integrations/page.tsx`):
- Phone verification card (3-step flow: input → OTP → verified)
- 4 platform cards with live status badges
- Per-card sync/disconnect/link actions
- "Sync all" button
- Animated transitions + loading states

**Navigation**:
- Sidebar: "Integrations" link added
- Mobile nav: "Connect" tab (replaced Messages to keep 5 items)

---

## How to use

### 1. Run database migration

```bash
npx prisma migrate dev --name add_integrations
npx prisma generate
```

### 2. Configure platform credentials (optional)

Add to `.env.local`:

```bash
# WhatsApp Business API
WHATSAPP_API_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token

# Facebook Page
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_token
```

> **Note**: Platform credentials are optional. The integration page now uses backend `/api/integrations/*` routes implemented in `app/api/integrations`.

### 3. Access the page

1. Sign up / log in
2. Navigate to **Customer Dashboard → Integrations** (sidebar or mobile "Connect" tab)
3. Enter phone number (E.164 format: `+60123456789`)
4. Verify OTP (in dev mode, OTP is shown in the response)
5. Click "Link using mobile number" on any platform card
6. Backend resolves platform identity and updates status

---

## Dev mode features

- **OTP shown in response** — no SMS needed for testing
- **Sandbox bypass buttons** on login page — skip auth entirely
- **Password-based auth** — no email confirmation required

---

## Platform behavior

| Platform | How it works | Status |
|----------|--------------|--------|
| **WhatsApp** | Checks Business API for number registration | `ACTIVE` if registered |
| **Telegram** | Matches phone to Telegram account via bot | `PENDING` until user starts bot |
| **TikTok** | CRM mapping only (no API access) | Always `ACTIVE` |
| **Facebook** | Graph API identity matching | `ACTIVE` if token valid |

---

## API examples

### Send OTP
```bash
curl -X POST http://localhost:3000/api/user/phone \
  -H "Content-Type: application/json" \
  -d '{"phone": "+60123456789"}'
```

### Verify OTP
```bash
curl -X POST http://localhost:3000/api/user/phone \
  -H "Content-Type: application/json" \
  -d '{"phone": "+60123456789", "otp": "123456"}'
```

### Sync all platforms
```bash
curl -X POST http://localhost:3000/api/integrations/sync \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Get status
```bash
curl http://localhost:3000/api/integrations/status
```

---

## Troubleshooting

**"Phone number already linked to another account"**
→ Each phone can only be linked to one user. Use a different number or disconnect from the other account.

**"OTP expired"**
→ OTPs expire after 5 minutes. Request a new one.

**Platform shows "RESTRICTED"**
→ Platform API credentials not configured in `.env.local`. This is expected in dev without credentials.

**"No verified phone number"**
→ Complete phone verification before syncing platforms.

---

## Next steps

- Add SMS delivery via Twilio/AWS SNS for production OTP
- Implement webhook handlers for platform events (Telegram bot messages, WhatsApp incoming messages)
- Add activity logs per platform
- Build messaging interface using linked platforms
- Add phone number reputation scoring
- Implement retry mechanism for failed syncs
- Add webhook handlers for platform events (Telegram bot messages, WhatsApp incoming messages)
- Add activity logs per platform
- Build messaging interface using linked platforms

---

**Status**: ⚠ Partially implemented — backend integration route scaffolding is now present, but platform event flows and richer sync workflows remain.
