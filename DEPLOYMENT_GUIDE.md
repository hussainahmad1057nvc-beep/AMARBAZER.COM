# 🚀 AmarBazar BD মাল্টি-প্ল্যাটফর্ম ডেপ্লয়মেন্ট গাইড (GitHub, Render, Firebase, Vercel & Play Store)

এই ডকুমেন্টে আপনার গিটহাবে কোড পুশ করার সাথে সাথে **Render**, **Firebase Hosting**, **GitHub Actions**, **Vercel** এবং **Google Play Store**-এ ডেপ্লয় করার সহজ নির্দেশিকা দেওয়া হয়েছে।

---

## 🚀 ১. Render (রিংডার)-এ ফুলস্ট্যাক সার্ভার ডেপ্লয় করার নিয়ম

Render (https://render.com)-এ এক্সপ্রেস ব্যাকএন্ড এবং রিঅ্যাক্ট ফ্রন্টএন্ড একসাথে চালানোর সবচেয়ে সহজ উপায়:

### ধাপসমূহ:
1. **Render Dashboard**-এ লগইন করুন এবং **New + -> Web Service** সিলেক্ট করুন।
2. আপনার GitHub রিপোজিটরি (`AmarBazarBD`) কানেক্ট করুন।
3. নিচের সেটিংসগুলো দিন:
   - **Name**: `amarbazar-web`
   - **Environment**: `Node`
   - **Branch**: `main` (বা `master`)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. **Environment Variables** সেকশনে যোগ করুন:
   - `NODE_ENV` = `production`
   - `VITE_FIREBASE_PROJECT_ID` = `amarbazer-519c5`
5. **Create Web Service** বাটনে ক্লিক করুন। Render স্বয়ংক্রিয়ভাবে বিল্ড করে লাইভ URL প্রদান করবে।

*(নোট: রিপোজিটরিতে `render.yaml` কনফিগার করা আছে, ফলে ব্লুপ্রিন্ট হিসেবেও সরাসরি ১-ক্লিকে ডেপ্লয় করা যাবে)*

---

## 🔥 ২. Firebase Hosting ও Firestore ডেপ্লয়মেন্ট

আপনার ফায়ারবেস প্রজেক্ট আইডি: `amarbazer-519c5`

### লোকাল টার্মিনাল বা GitHub থেকে ডেপ্লয়:
```bash
# ১. ফায়ারবেস সিএলআই দিয়ে লগইন
firebase login

# ২. প্রজেক্ট সিলেক্ট
firebase use amarbazer-519c5

# ৩. ফ্রন্টএন্ড বিল্ড তৈরি
npm run build

# ৪. ফায়ারবেস হোস্টিং ও সিকিউরিটি রুলস ডেপ্লয়
firebase deploy
```

---

## 🛠️ ৩. GitHub Actions অটোমেশন (CI/CD)

আপনার রিপোজিটরিতে `.github/workflows/deploy.yml` প্রস্তুত রয়েছে। কোড পুশ করার সাথে সাথে এটি:
1. সম্পূর্ণ টাইপস্ক্রিপ্ট ও বিল্ড ভেরিফাই করবে।
2. কোনো মিসিং সিক্রেট থাকলেও এরর দিয়ে ফেইল করবে না, বরং স্কিপ করে বিল্ড সাকসেস রাখবে।
3. যদি `RENDER_DEPLOY_HOOK_URL` বা `VERCEL_TOKEN` দেওয়া থাকে, তবে অটোমেটিক লাইভ ডেপ্লয় করে দিবে।

---

## 📱 ৪. Google Play Store ও Android Signing

অ্যান্ড্রয়েড রিলিজ বান্ডেল তৈরি করার কমান্ড:
```bash
# ১. ডিপেন্ডেন্সি ও বিল্ড
npm install
npm run build

# ২. ক্যাপাসিটর অ্যান্ড্রয়েড সিঙ্ক
npx cap sync android

# ৩. অ্যান্ড্রয়েড স্টুডিওতে ওপেন
npx cap open android
```
