# צירים

מעקב צירים בבית — משך, מרווח וכלל 5-1-1, עד שיוצאים לחדר לידה. הכל נשמר במכשיר, בלי חשבון ובלי שרת.

## הרצה (Web / PWA)

```bash
npm install
npm run dev
```

אותו קוד רץ בדפדפן וכהתקנת PWA. אין שינוי בנתיב הזה כשמוסיפים Native.

## Android / iPhone (Capacitor)

האפליקציה לא נבנית מחדש ל-Native. Capacitor עוטף את אותו React, עם רטט, מסך דולק ושיתוף של המערכת.

פעם ראשונה:

```bash
npm install
npm run native:init
```

זה בונה גרסת SPA סטטית אל `dist/client`, ויוצר את תיקיות `android/` ו-`ios/` אם הן חסרות.

כל עדכון אחרי זה:

```bash
npm run native:sync
npx cap open android   # Android Studio → APK
npx cap open ios       # Xcode, רק מ-Mac
```

`npm run build` נשאר בילוד ה-Web/PWA (Nitro). `npm run native:web` הוא הבילוד הסטטי ל-WebView בלבד.

## מה בפנים

- שתי לחיצות לכל ציר: **התחיל** / **נגמר**
- בין צירים: האם נשארים בבית, או שכבר יוצאים
- עוצמה 1–5, ירידת מים, היסטוריה ושיתוף למיילדת
- כלל 5-1-1 (לידה ראשונה) או 7-0.75-0.5 (לידה חוזרת)
- מסך דולק, רטט, מצב לילה, עברית מימין לשמאל
- Web, PWA, Android ו-iOS מאותו קוד

זה מעקב בלבד, לא ייעוץ רפואי.
