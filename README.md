# Postify Backend

A modular express.js backend for my small Postify social web app.  
Handles authentication, posts, comments, reactions, and user profiles with role-based permissions and restriction levels.

---

## Features

- **🔒 Authentication:**  
  Local, Google, and GitHub OAuth login/register/logout.

- **📝 Posts:**  
  Create, view, edit, and delete posts.

- **💬 Comments:**  
  Add, view, edit, and delete comments.

- **😮 Reactions:**  
  Like/react to posts and comments.

- **👥 User Profiles:**  
  View and edit user profiles, upload profile pictures.

- **🛡️ Permissions & Restrictions:**  
  Role-based access control and user restriction levels.

---

## 🧰Tech Stack

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
- [Passport.js](http://www.passportjs.org/) (local, Google, GitHub strategies)
- [Cloudinary](https://cloudinary.com/) (profile picture uploads)
- [Multer](https://github.com/expressjs/multer) (file uploads)
- [dotenv](https://github.com/motdotla/dotenv) (environment variables)

---

## ⚙️Getting Started

### 📦 Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/) instance

### 📥 Installation

```bash
git clone https://github.com/beyondbytes13309/postify-backend.git
cd postify-backend
npm install
```
The frontend can be found at [postify-frontend](https://github.com/beyondbytes13309/postify-frontend)

### 🛠️ Environment Variables

Create a `.env` file in the root folder with:

```
PORT=3000
MONGODB_CONNECTION_STRING=your_mongodb_uri
SESSION_SECRET=your_session_secret
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URL=http://localhost:3000/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URL=http://localhost:3000/auth/github/callback

SUCCESS_REDIRECT=http://localhost:5173/
FAILURE_REDIRECT=http://localhost:5173/auth
```

### ▶️ Running the Server

```bash
npm run dev
```

The API will be available at [http://localhost:3000](http://localhost:3000).

---

## 📂Project Structure

```
models/         # Mongoose models (User, Post, Comment, Reaction)
controllers/    # Route handlers
routes/         # Express routers
middleware/     # Auth and permission middleware
utils/          # Utility functions (cloudinary, passport, security)
server.js       # Entry point
```

---

## 🌐API Endpoints

### 🔑 `/auth` — Authentication
- `GET /auth/google` → Google OAuth Login
- `GET /auth/github` → GitHub OAuth Login
- `POST /auth/register` → Register a new user
- `POST /auth/login` → Login with username and password
- `POST /auth/logout` → Logout from account
### 👤 `/user` — User profile management
- `GET /getUserData` → Get current user's profile data
- `GET /getAnyUserData/:userID` → Get profile data of any user
- `PATCH /user/editUser` → Edit user fields: username, display name and bio
- `PATCH /user/editSpecificUser/:userID` → Edit any user's fields (for admins)
- `PATCH /user/editPfp` → Edit user's profile picture
- `PATCH /user/editSpecificPfp/:userID` → Edit any user's profile picture (for admins)
- `PATCH /restrictUser/:userID` → Restrict users (for admins and moderators)
### 📝 `/post` — Post CRUD
- `GET /post/getPosts` → Get posts 
- `GET /post/getUserPosts/:userID` → Get a user's posts
- `POST /post/createPost` → Create a post
- `POST /post/editPost/:postID` → Edit a post
- `DELETE /post/deletePost/:postID` → Delete a post
### 💬 `/comment` — Comment CRUD
- `GET /comment/getComments/:postID` → Get comments for a post
- `POST /comment/createComment` → Create a comment
- `PATCH /comment/editComment/:commentID` → Edit a comment
- `DELETE /comment/deleteComment/:commentID` → Delete a comment
### 😮 `/reaction` — Reaction CRUD
 - `POST /reaction/makeReaction` → Make a reaction
 - `DELETE /reaction/deleteReaction/:reactionID` → Delete a reaction

### 📝 Few Notes
- All endpoints require authentication and authorization except `/auth`
- All the custom status codes can be found at [docs/status_codes.xlsx](docs/status_codes.xlsx)


---

## 🤝Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

---

## 🎉Acknowledgements

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Passport.js](http://www.passportjs.org/)
- [Cloudinary](https://cloudinary.com/)

---

**Happy Posting!**