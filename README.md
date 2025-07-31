

# 🩺 LifeLine – Emergency Healthcare Web App

LifeLine is a smart emergency response platform built with the MERN stack (MongoDB, Express, React, Node.js). It aims to streamline communication and coordination between patients, ambulances, and hospitals to reduce delays during critical situations.

## 🚀 Features

- 🧭 Real-time ambulance request and acceptance system
- 🏥 Admin dashboard for hospitals and ambulance drivers
- 📍 Geolocation-based ambulance assignment (proximity-based dispatch)
- 🔐 Role-based authentication (Admin, Ambulance Driver, Patient)
- 🗃️ MongoDB Atlas for cloud-based data storage
- ⚡ Fast and scalable Express.js backend

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Token)


---

## 📁 Folder Structure

```
lifeline-emergency-platform/
├── app/                      # Main application directory
│   ├── api/                  # API routes
│   ├── admin/               # Admin-related pages
│   ├── hospital/            # Hospital-related pages
│   ├── user/                # User-related pages
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration files
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # Reusable components
│   └── ui/                  # UI components
├── public/                  # Static assets
├── styles/                  # Additional styles
├── lib/                     # Library code
├── hooks/                   # Custom React hooks
├── .next/                   # Next.js build output
├── node_modules/            # Dependencies
├── package.json            # Project configuration
├── package-lock.json       # Dependency lock file
├── tsconfig.json           # TypeScript configuration
├── next.config.mjs         # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── postcss.config.mjs      # PostCSS configuration
└── components.json         # Components configuration



````

---

## 🧪 Getting Started Locally

### 1. Clone the repository

```bash
git clone https://github.com/Shamanth-k/emergency-health-care-webapp-.git
cd emergency-health-care-webapp-
````

### 2. Run website

```bash
cd file name
npm install
# Create a .env.local file with:
# MONGO_URI=<your_mongodb_uri>

#go to Api folder and in all the sub folder open route folders and add your mongodb connection string in the place of your mongodb url
npm run dev
```

The website will start on `http://localhost:3000`

---

## 📌 Future Improvements

* ✅ Google Maps integration for real-time ambulance tracking
* ✅ Notifications system for accepted/rejected requests
* 🔒 Two-factor authentication
* 📱 Mobile-responsive design (or separate mobile app)

---

## 🧑‍💻 Author

**Shamanth Krishna V R**
🔗 [GitHub](https://github.com/Shamanth-k)
📫 [LinkedIn](https://www.linkedin.com/in/shamanthkrishna/)

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).


