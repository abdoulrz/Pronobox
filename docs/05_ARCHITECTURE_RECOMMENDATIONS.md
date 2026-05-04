# Architecture Recommendations — PronosBox

Given the Contabo VPS infrastructure and the social+betting nature of the platform, here are the key architectural decisions for the current and next phases.

---

## 1. Real-Time Updates (WebSockets)

A placeholder `WebSocketService.tsx` already exists. Here is when and how to wire it up:

### What Needs Real-Time?
- **Channel Chat:** Messages in `ChannelView.tsx` should update without a page refresh.
- **Box Feed:** New posts from followed users should appear without reload.
- **Live Scores:** Match results should update as goals happen.

### Recommended Approach: Socket.io

Add `socket.io` to the Express backend and `socket.io-client` to the frontend.

```bash
# Backend
npm install socket.io

# Frontend
npm install socket.io-client
```

The `WebSocketService.tsx` should wrap the client and expose event hooks (`useChannel`, `useLiveMatch`) that components consume.

**Why not polling?** Polling (calling the API every N seconds) wastes bandwidth and battery on mobile. Socket.io is the right tool given Contabo VPS's persistent Node.js process (PM2).

---

## 2. Channel Architecture — Telegram-Style

### Current Model
Channels store messages as an embedded array inside the `Channel` document. This is fine for low-volume channels but will create large documents as messages accumulate.

### Recommendation: Separate `Message` Collection

Once a channel reaches 500+ messages, create a separate `Message` model:

```js
// Future: src/models/Message.js
const MessageSchema = new mongoose.Schema({
  channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
```

This enables pagination (last 50 messages) and keeps `Channel` documents lean.

---

## 3. Media Uploads — User Avatars & Channel Images

Currently, avatars are Unsplash URLs (hardcoded). For production:

### Step A: Accept Uploads on the Backend

Use `multer` for handling `multipart/form-data` on the Express server:

```bash
npm install multer
```

### Step B: Store on Contabo Disk or Object Storage

- **Phase 1 (Simple):** Save to `/var/www/pronosbox/uploads/` on the Contabo VPS. Serve via Nginx static files.
- **Phase 2 (Scale):** Use Cloudflare R2 or Backblaze B2 for object storage (cheaper than S3, fast CDN).

### Step C: Validation
- Validate MIME type (`image/jpeg`, `image/png`, `image/webp`).
- Resize & convert to WebP using `sharp` before saving to reduce storage costs.

```bash
npm install sharp
```

---

## 4. Feed Pagination — The Box (Social Feed)

`Box.tsx` currently loads all posts at once. This will become a performance issue after 50+ posts.

### Solution: Cursor-Based Pagination

Backend returns posts with a `cursor` (last `_id` seen):

```js
// GET /api/posts?cursor=<lastPostId>&limit=20
app.get('/api/posts', authenticateToken, async (req, res) => {
  const { cursor, limit = 20 } = req.query;
  const query = cursor ? { _id: { $lt: cursor } } : {};
  const posts = await Post.find(query)
    .sort({ _id: -1 })
    .limit(Number(limit))
    .populate('user', 'username avatar isPro');
  res.json(posts);
});
```

The frontend implements an **Infinite Scroll** using an `IntersectionObserver`.

---

## 5. Security Hardening (Pre-Production)

Before going live on Contabo:

- [ ] **Rate Limiting:** Add `express-rate-limit` to auth routes (`/api/auth/*`) to prevent brute-force.
- [ ] **Helmet.js:** Add `helmet` middleware for secure HTTP headers.
- [ ] **CORS:** Restrict `cors()` to your production domain instead of `*`.
- [ ] **Input Validation:** Add `express-validator` to validate request bodies before touching MongoDB.
- [ ] **MongoDB:** Bind to `127.0.0.1` only (do not expose port `27017` to the public internet).
