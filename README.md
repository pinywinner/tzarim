# מעקב צירים

מעקב צירים בבית — משך, מרווח וכלל 5-1-1, עד שיוצאים לחדר לידה. הכל נשמר במכשיר, בלי חשבון ובלי שרת.

## הרצה (Web / PWA)

```bash
npm install
npm run dev
```

אותו קוד רץ בדפדפן וכהתקנת PWA. אין שינוי בנתיב הזה כשמוסיפים Native.

## Android / iPhone (Capacitor)

האפליקציה לא נבנית מחדש ל-Native. Capacitor עוטף את אותו React, עם רטט, מסך דולק ושיתוף של המערכת.

תיקיית `android/` כבר בריפו (פרויקט Gradle מוכן, כולל אייקון וספלאש של מעקב צירים). אחרי clone:

```bash
npm install
npm run native:sync
npx cap open android   # Android Studio
npx cap open ios       # Xcode, רק מ-Mac
```

`npm run native:sync` בונה SPA סטטי אל `dist/client` ומרענן את ה-WebView. אם `android/` או `ios/` חסרות אצלך מסיבה כלשהי:

```bash
npm run native:init
```

APK (דורש JDK 21 + Android SDK):

```bash
npm run native:apk
```

הקובץ יוצא אל `android/app/build/outputs/apk/debug/app-debug.apk`. זה חבילת debug להתקנה ידנית, לא לחנות.

`npm run build` נשאר בילוד ה-Web/PWA (Nitro). `npm run native:web` הוא הבילוד הסטטי ל-WebView בלבד.

## מה בפנים

- שתי לחיצות לכל ציר: **התחיל** / **נגמר**
- בין צירים: האם נשארים בבית, או שכבר יוצאים
- עוצמה 1–5, ירידת מים, היסטוריה ושיתוף למיילדת
- כלל 5-1-1 (לידה ראשונה) או 7-0.75-0.5 (לידה חוזרת)
- מסך דולק, רטט, מצב לילה, עברית מימין לשמאל
- Web, PWA, Android ו-iOS מאותו קוד

זה מעקב בלבד, לא ייעוץ רפואי.
