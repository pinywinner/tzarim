# מעקב צירים

בזמן ציר, כשקשה לחשוב — מה לעשות עכשיו.
משך, מרווח, ומתי יוצאים לחדר לידה.

הכל נשמר במכשיר. בלי חשבון, בלי ענן, בלי פרסומות.

## הורדה

- [טלפון · Android](https://github.com/pinywinner/tzarim/releases/download/v1.4.1/tzarim-1.4.1.apk)
- [שעון · Wear OS](https://github.com/pinywinner/tzarim/releases/download/v1.4.1/tzarim-wear-1.4.1.apk)

בטלפון: פתחי את הקובץ ואשרי התקנה ממקור לא מוכר אם אנדרואיד מבקש.
בשעון: דרך ADB, או העלאה ל־Play כ־Wear app.

כל הגרסאות: [Releases](https://github.com/pinywinner/tzarim/releases)

## מה בפנים

- שתי לחיצות לכל ציר: **התחיל** / **סיימתי**
- טיימר גדול, ומסך שנושם עם הציר
- בין צירים: האם נשארים בבית, או שכבר יוצאים
- כלל 5-1-1 ללידה ראשונה, או 7-0.75-0.5 ללידה חוזרת
- עוצמה, היסטוריה, ושיתוף סיכום למיילדת
- עברית ואנגלית, מצב לילה
- שעון Wear OS שעובד לבד, בלי הטלפון

זה מעקב בלבד, לא ייעוץ רפואי. במצב חירום — מד״א 101.

[מדיניות פרטיות](https://pinywinner.github.io/tzarim/privacy.html)

## שעון

אותו רעיון, על פרק כף היד: התחיל, סיימתי, טיימר, מרווח.
מה כבר שם ומה עוד לבנות: [docs/WEAR.md](docs/WEAR.md)

## חנות Play

הטקסטים, הקטגוריה והדיסקליימר: [docs/PLAY.md](docs/PLAY.md)

## למפתחים

אותו קוד רץ כ־Web, PWA, Android ו־iOS (Capacitor). השעון הוא מודול Wear נפרד.

```bash
npm install
npm run dev
```

גרסה אחת ב־`version.json`. תג `vX.Y.Z` מפרסם APK לטלפון ולשעון.
המשך עבודה על השעון בבראנץ' [`wear`](https://github.com/pinywinner/tzarim/tree/wear).
