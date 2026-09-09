# מעקב צירים

מעקב צירים בבית — משך, מרווח וכלל 5-1-1, עד שיוצאים לחדר לידה. הכל נשמר במכשיר, בלי חשבון ובלי שרת.

## הורדה לאנדרואיד

[**הורידי את ה-APK (v1.2.0)**](https://github.com/pinywinner/tzarim/releases/download/v1.2.0/tzarim-1.2.0.apk)
 · [AAB לפליי](https://github.com/pinywinner/tzarim/releases/download/v1.2.0/tzarim-1.2.0.aab)

בטלפון: פתחי את ה-APK → אפשרי התקנה ממקור לא מוכר אם אנדרואיד מבקש. לפליי מעלים את ה-AAB, לא את ה-APK.

כל הגרסאות: [Releases](https://github.com/pinywinner/tzarim/releases)

## גרסאות

מספר הגרסה יושב ב־`version.json` ומסתנכרן ל-Android, ל-iOS ולהגדרות באפליקציה.

```bash
npm run version:show              # 1.0.0 (1)
npm run version:bump -- patch     # 1.0.1
npm run version:bump -- minor     # 1.1.0
npm run version:bump -- major     # 2.0.0
```

אחרי bump: קומיט, תג `vX.Y.Z`, ו־push של התג. GitHub Actions בונה APK ומפרסם Release.

לחתימה קבועה (התקנות עוקבות בלי להסיר את הישנה) הוסיפי ב־GitHub Secrets:
`TZARIM_KEYSTORE_BASE64`, `TZARIM_KEYSTORE_PASSWORD`, `TZARIM_KEY_ALIAS`, `TZARIM_KEY_PASSWORD`.
בלי הסודות מתפרסם APK מסוג debug.

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

APK מקומי (דורש JDK 21 + Android SDK):

```bash
npm run native:apk
```

הקובץ יוצא אל `android/app/build/outputs/apk/debug/app-debug.apk`.

## מה בפנים

- שתי לחיצות לכל ציר: **התחיל** / **סיימתי**
- בין צירים: האם נשארים בבית, או שכבר יוצאים
- עוצמה 1–5, ירידת מים, היסטוריה ושיתוף למיילדת
- כלל 5-1-1 (לידה ראשונה) או 7-0.75-0.5 (לידה חוזרת)
- מסך דולק, רטט, מצב לילה, עברית מימין לשמאל
- Web, PWA, Android ו-iOS מאותו קוד

זה מעקב בלבד, לא ייעוץ רפואי.
