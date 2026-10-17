# 📸 Snapzy Frontend 

![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-purple?style=for-the-badge&logo=vite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-orange?style=for-the-badge&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-blue?style=for-the-badge&logo=css3)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-v2-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide_Icons-F05340?style=for-the-badge&logo=lucide&logoColor=white)
![Git](https://img.shields.io/badge/Git-Version%20Control-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-Code-181717?style=for-the-badge&logo=github&logoColor=white)
![VS Code](https://img.shields.io/badge/VS%20Code-Editor-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)

A modern, high-performance social media frontend web application built with **React 19**, **Vite 8**, and **Tailwind CSS v4**. Snapzy delivers a seamless, Instagram-like experience allowing users to share moments, discover trending content, engage with creators via likes and comments, track real-time notifications, view categorized activity history, and customize personal profiles.

------------------------------------------------------------------------
## 📸 Screenshots

### 🏠 Home Feed

![Home](./Snapzy%20Frontend/src/ScreenShots/HomePage.png)

The Home Feed delivers a clean, responsive feed displaying posts from creators. Users can like posts with instant counter feedback, open interactive comment modals, bookmark posts, follow creators directly from the feed, and explore suggested accounts from the right sidebar.

---

### ➕ Create Post

![Create Post](./Snapzy%20Frontend/src/ScreenShots/CreatePost.png)

The Create Post page provides a streamlined workflow to upload photos (with instant image preview and size validation up to 5 MB), compose captions with real-time character counters, attach location geotags, add hashtags, and publish posts instantly.

---

### 🔍 Search & Explore

![Search](./Snapzy%20Frontend/src/ScreenShots/SearchPage.png)

The Search & Explore page enables instant, real-time discovery of user accounts and community posts. Users can filter results across all categories, follow/unfollow creators with one click, and preview post grids with hover statistics.

---

### ⚡ Activity Hub

![Activity](./Snapzy%20Frontend/src/ScreenShots/ActivityPage.png)

The Activity page organizes personal engagement in a chronological timeline. Users can review likes, comments, saved posts, and follows with color-coded badge indicators, smart date grouping (Today, Yesterday, This week, Earlier), and flexible sorting options.

---

### 👤 Profile

![Profile](./Snapzy%20Frontend/src/ScreenShots/ProfilePage.png)

The Profile page showcases user details including avatar, bio, follower/following counts, and post counts. Creators can edit their profile information, share their profile link, manage uploaded posts (edit and delete), and explore their personalized post grid.

------------------------------------------------------------------------

# 📌 Features

### 🔐 Authentication & Security
- User registration and login with input validation
- Forgot password workflow
- Route protection with `ProtectedRoute` and `PublicRoute` guards
- Persistent session handling and automated user hydration via `AuthContext`

### 📰 Post Feed & Interactions
- Responsive feed with rich post cards (author info, location, timestamps, image zoom)
- Dynamic like/unlike toggle with instant count synchronization
- Interactive comment modal with threaded discussions and comment counters
- Bookmark / Save posts to revisit in a dedicated collection
- Follow / Unfollow creators directly from feeds, suggestions, or profiles
- Suggested creators sidebar on desktop screens

### ➕ Post Creation & Management
- Photo upload with drag-and-drop or file picker (PNG, JPG, WEBP)
- Image preview with replace and remove functionality
- Caption editor with real-time character count limitation (500 chars max)
- Geotagging / location picker and comma-separated hashtag parsing
- Edit existing posts or delete posts with instant feed updates

### 🔍 Explore & Discovery
- Fast search querying across usernames, profiles, and post captions and hashtag
- Category filtering tabs: **All**, **Accounts**, and **Posts**
- Interactive explore grid with hover engagement stats (likes and comments)

### 🔔 Notifications & Activity Tracker
- Dedicated notification center with unread notification badge counter
- Auto-syncing notifications on window focus and scheduled polling
- Comprehensive activity history with category badges (Likes, Comments, Saves, Follows)
- Date-grouped activity sorting (Today, Yesterday, This Week, This Month, Earlier)

### 👤 Profile & Customization
- Personalized profile page with avatar, bio, location, and stats
- Profile editing (name, username, bio, profile photo)
- Dedicated views for **Liked Posts** and **Saved Posts**
- Account settings with password change and account information management

### 📱 Responsive & Modern UI/UX
- Tailored dual navigation: fixed desktop sidebar, mobile top header, and mobile bottom navigation bar
- Smooth skeleton loading states (`SkeletonLoader`) and app loading indicators (`AppLoader`)
- Modern design aesthetics crafted with Tailwind CSS v4 and Lucide React icons

------------------------------------------------------------------------

# 🛠️ Technologies Used

- **React 19** - Modern component-based UI library
- **Vite 8** - Blazing-fast frontend build tool and dev server
- **Tailwind CSS v4** - Next-generation utility-first CSS framework
- **React Router DOM v7** - Declarative client-side routing with nested routes
- **Context API** - Global state management for authentication (`AuthContext`) and notifications (`NotificationContext`)
- **Redux Toolkit** - Predictable centralized state container
- **Axios** - Promise-based HTTP client configured with credentials support
- **Lucide React & React Icons** - Clean, consistent modern iconography
- **JavaScript (ES6+)** - Modern JavaScript syntax and modular structure
- **HTML5 & CSS3** - Semantic structure and custom animations

------------------------------------------------------------------------

# 📂 Project Structure

```text
snapzy/
├── public/
├── src/
│   ├── api/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── routes/
│   ├── ScreenShots/
│   ├── utils/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── eslint.config.js
├── index.html
├── package.json
└── vite.config.js
```

------------------------------------------------------------------------

# 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher) or **yarn** / **pnpm**
- Running **Snapzy Backend API**

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Dodiya-Keyur/Snapzy-Frontend.git
   cd Snapzy Frontend
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Verify API Configuration:**
   The Axios instance is configured in `src/api/axios.js`. By default, it communicates with:
   ```javascript
   baseURL: "http://localhost:3000/api",
   withCredentials: true
   ```
   *Make sure your backend server is running and accessible on that port.*

4. **Start the local development server:**
   ```bash
   npm run dev
   ```

5. **Open the application:**
   Navigate to `http://localhost:5173` in your browser.

------------------------------------------------------------------------

# 💡 Future Improvements

- [ ] Direct messaging & real-time chat with Socket.io
- [ ] Stories feature with disappearing 24-hour media
- [ ] Video playback and Reels feed
- [ ] Dark mode toggle with system theme preference
- [ ] Web push notifications
- [ ] Progressive Web App (PWA) offline support

------------------------------------------------------------------------

# 💻 Author

**Keyur Dodiya**

Computer Science Engineering Student

Building scalable web applications and continuously learning new technologies.

GitHub: [http://github.com/Dodiya-Keyur/](http://github.com/Dodiya-Keyur/)

------------------------------------------------------------------------

## ⭐ If you like this project, give it a star on GitHub!
