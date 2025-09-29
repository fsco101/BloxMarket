# BloxMarket CRUD Operations Guide 🔧

## Overview

All CRUD (Create, Read, Update, Delete) operations are fully implemented and ready to use! This guide covers all available endpoints and how to use them.

## 🚀 Quick Test

### Start Your Servers
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### Test CRUD Operations
1. Visit `http://localhost:5173`
2. Register/Login to get authentication
3. Use the UI to test all features or use the API directly

---

## 📊 **TRADES CRUD**

### ✅ **Available Operations:**

| Operation | Method | Endpoint | Auth Required | Description |
|-----------|--------|----------|---------------|-------------|
| **Get All Trades** | GET | `/api/trades` | ❌ No | List all trades with pagination |
| **Get Single Trade** | GET | `/api/trades/:id` | ❌ No | Get specific trade details |
| **Create Trade** | POST | `/api/trades` | ✅ Yes | Create new trade listing |
| **Update Trade Status** | PUT | `/api/trades/:id/status` | ✅ Yes | Update trade status |
| **Delete Trade** | DELETE | `/api/trades/:id` | ✅ Yes | Delete trade (owner/admin only) |
| **Get User Trades** | GET | `/api/trades/user/:userId` | ❌ No | All trades by specific user |

### 🧪 **Test Examples:**

#### Create Trade
```bash
curl -X POST http://localhost:5000/api/trades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "itemOffered": "Dominus Empyreus",
    "itemRequested": "Robux",
    "description": "Trading rare dominus for robux or good items"
  }'
```

#### Get All Trades (with pagination)
```bash
curl "http://localhost:5000/api/trades?page=1&limit=5&status=open"
```

#### Update Trade Status
```bash
curl -X PUT http://localhost:5000/api/trades/TRADE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"status": "completed"}'
```

### 📋 **Trade Statuses:**
- `open` - Available for trading
- `in_progress` - Currently being negotiated
- `completed` - Trade finished successfully
- `cancelled` - Trade was cancelled

---

## 💬 **FORUM CRUD**

### ✅ **Available Operations:**

| Operation | Method | Endpoint | Auth Required | Description |
|-----------|--------|----------|---------------|-------------|
| **Get Posts** | GET | `/api/forum/posts` | ❌ No | List forum posts with pagination |
| **Get Single Post** | GET | `/api/forum/posts/:id` | ❌ No | Get post with comments |
| **Create Post** | POST | `/api/forum/posts` | ✅ Yes | Create new forum post |
| **Add Comment** | POST | `/api/forum/posts/:id/comments` | ✅ Yes | Add comment to post |
| **Delete Post** | DELETE | `/api/forum/posts/:id` | ✅ Yes | Delete post (owner/admin only) |

### 🧪 **Test Examples:**

#### Create Forum Post
```bash
curl -X POST http://localhost:5000/api/forum/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Best Trading Tips for Beginners",
    "content": "Here are some essential tips for new traders...",
    "category": "trading_tips"
  }'
```

#### Add Comment
```bash
curl -X POST http://localhost:5000/api/forum/posts/POST_ID/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"content": "Great post! Very helpful tips."}'
```

#### Get Posts by Category
```bash
curl "http://localhost:5000/api/forum/posts?category=trading_tips&page=1&limit=10"
```

### 📂 **Forum Categories:**
- `trading_tips` - Trading advice and strategies
- `scammer_reports` - Report suspicious users
- `game_updates` - Roblox game updates and news
- `general` - General discussion

---

## 🎉 **EVENTS CRUD**

### ✅ **Available Operations:**

| Operation | Method | Endpoint | Auth Required | Description |
|-----------|--------|----------|---------------|-------------|
| **Get All Events** | GET | `/api/events` | ❌ No | List all events |
| **Get Single Event** | GET | `/api/events/:id` | ❌ No | Get specific event details |
| **Create Event** | POST | `/api/events` | ✅ Admin/Mod | Create new event (admin only) |
| **Update Event** | PUT | `/api/events/:id` | ✅ Admin/Mod | Update event (admin only) |
| **Delete Event** | DELETE | `/api/events/:id` | ✅ Admin/Mod | Delete event (admin only) |

### 🧪 **Test Examples:**

#### Create Event (Admin Only)
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "title": "Christmas Giveaway 2025",
    "description": "Win exclusive Christmas items!",
    "startDate": "2025-12-24T00:00:00Z",
    "endDate": "2025-12-31T23:59:59Z"
  }'
```

#### Get All Events
```bash
curl http://localhost:5000/api/events
```

#### Update Event (Admin Only)
```bash
curl -X PUT http://localhost:5000/api/events/EVENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "title": "Updated Christmas Giveaway",
    "description": "Extended deadline for more participants!"
  }'
```

---

## 👤 **USER PROFILE CRUD**

### ✅ **Available Operations:**

| Operation | Method | Endpoint | Auth Required | Description |
|-----------|--------|----------|---------------|-------------|
| **Get User Profile** | GET | `/api/users/:userId` | ❌ No | Get user profile with stats |
| **Update Profile** | PUT | `/api/users/profile` | ✅ Yes | Update own profile |
| **Get User Wishlist** | GET | `/api/users/:userId/wishlist` | ❌ No | Get user's wishlist |
| **Add to Wishlist** | POST | `/api/users/wishlist` | ✅ Yes | Add item to wishlist |
| **Remove from Wishlist** | DELETE | `/api/users/wishlist/:id` | ✅ Yes | Remove wishlist item |

### 🧪 **Test Examples:**

#### Get User Profile
```bash
curl http://localhost:5000/api/users/USER_ID
```

#### Update Profile
```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "robloxUsername": "MyNewRobloxName",
    "avatarUrl": "https://example.com/avatar.png"
  }'
```

#### Add to Wishlist
```bash
curl -X POST http://localhost:5000/api/users/wishlist \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"itemName": "Dominus Frigidus"}'
```

---

## 🎯 **Frontend Integration**

### Using the API Service

All CRUD operations are available through the `apiService` in your frontend:

```typescript
import { apiService } from './services/api';

// Trades
const trades = await apiService.getTrades({ page: 1, limit: 10 });
const newTrade = await apiService.createTrade({
  itemOffered: "Item Name",
  itemRequested: "Another Item",
  description: "Trade description"
});

// Forum
const posts = await apiService.getForumPosts({ category: "trading_tips" });
await apiService.createForumPost({
  title: "New Post",
  content: "Post content",
  category: "general"
});

// Events
const events = await apiService.getEvents();
// Only admins can create events
await apiService.createEvent({
  title: "New Event",
  description: "Event description"
});

// User Profile
const profile = await apiService.getUserProfile(userId);
await apiService.updateProfile({
  robloxUsername: "NewUsername"
});

// Wishlist
await apiService.addToWishlist("Desired Item");
const wishlist = await apiService.getUserWishlist(userId);
```

---

## 🔒 **Permission System**

### **Public Operations** (No Auth Required)
- ✅ View all trades, forum posts, events
- ✅ View user profiles and wishlists
- ✅ Get specific items by ID

### **User Operations** (Auth Required)
- ✅ Create/update/delete own trades
- ✅ Create forum posts and comments
- ✅ Update own profile
- ✅ Manage own wishlist
- ✅ Delete own forum posts

### **Admin/Moderator Operations**
- ✅ Create/update/delete events
- ✅ Delete any trade or forum post
- ✅ Update any trade status
- ✅ Full moderation capabilities

---

## 📊 **Data Models**

### Trade Model
```javascript
{
  _id: "ObjectId",
  user_id: "ObjectId", // Reference to User
  item_offered: "String", // Required
  item_requested: "String", // Optional
  description: "String", // Optional
  status: "open|in_progress|completed|cancelled", // Default: "open"
  images: ["String"], // Optional array of image URLs
  createdAt: "Date",
  updatedAt: "Date"
}
```

### Forum Post Model
```javascript
{
  _id: "ObjectId",
  user_id: "ObjectId", // Reference to User
  title: "String", // Required
  content: "String", // Required
  category: "trading_tips|scammer_reports|game_updates|general",
  upvotes: "Number", // Default: 0
  downvotes: "Number", // Default: 0
  createdAt: "Date",
  updatedAt: "Date"
}
```

### Event Model
```javascript
{
  _id: "ObjectId",
  title: "String", // Required
  description: "String", // Optional
  start_date: "Date", // Optional
  end_date: "Date", // Optional
  created_by: "ObjectId", // Reference to User (admin/mod)
  createdAt: "Date",
  updatedAt: "Date"
}
```

### User Model
```javascript
{
  _id: "ObjectId",
  username: "String", // Unique, required
  email: "String", // Unique, required
  password_hash: "String", // Hashed password
  roblox_username: "String", // Optional
  avatar_url: "String", // Optional
  credibility_score: "Number", // Default: 0
  role: "user|moderator|admin", // Default: "user"
  createdAt: "Date",
  updatedAt: "Date"
}
```

---

## 🧪 **Complete Testing Workflow**

### 1. **Setup & Authentication**
```bash
# Start servers
cd backend && npm run dev &
cd frontend && npm run dev

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "password123"
  }'

# Copy the JWT token from response
```

### 2. **Test Trades CRUD**
```bash
# Create trade
curl -X POST http://localhost:5000/api/trades \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemOffered": "Test Item", "description": "Test trade"}'

# Get all trades
curl http://localhost:5000/api/trades

# Update trade status (use trade ID from create response)
curl -X PUT http://localhost:5000/api/trades/TRADE_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

### 3. **Test Forum CRUD**
```bash
# Create post
curl -X POST http://localhost:5000/api/forum/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post",
    "content": "This is a test post",
    "category": "general"
  }'

# Get posts
curl http://localhost:5000/api/forum/posts

# Add comment (use post ID from create response)
curl -X POST http://localhost:5000/api/forum/posts/POST_ID/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test comment"}'
```

### 4. **Test User Profile**
```bash
# Get your user ID from auth response, then:
curl http://localhost:5000/api/users/YOUR_USER_ID

# Update profile
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"robloxUsername": "TestRobloxUser"}'

# Add to wishlist
curl -X POST http://localhost:5000/api/users/wishlist \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemName": "Desired Item"}'
```

---

## 🐛 **Common Issues & Solutions**

| Issue | Cause | Solution |
|-------|-------|----------|
| "Token required" | Missing Authorization header | Add `Authorization: Bearer TOKEN` |
| "Invalid trade ID" | Wrong ObjectId format | Use valid MongoDB ObjectId |
| "Not authorized" | Wrong user/insufficient permissions | Check ownership or admin role |
| "Validation error" | Missing required fields | Check required fields in models |
| "CORS error" | Frontend/backend different ports | Verify CORS settings in server.js |

---

## 🚀 **Next Steps**

Your CRUD operations are complete! Consider implementing:

1. **Image Upload** for trades
2. **Voting System** for forum posts
3. **Real-time Chat** for trading
4. **Notification System** 
5. **Advanced Search & Filters**
6. **Trade History & Analytics**

## 🎉 **Summary**

✅ **All CRUD operations implemented and tested**
✅ **Authentication & authorization working**  
✅ **Frontend API service ready**
✅ **Comprehensive error handling**
✅ **MongoDB integration complete**

Your BloxMarket platform is fully functional with all core features! 🎮✨