# שעון Wear OS

השעון הוא אפליקציה נפרדת (`il.tzarim.watch`), לא WebView.
הוא עובד לבד, בלי הטלפון.

## מה כבר עובד

- התחיל / סיימתי
- טיימר בזמן ציר
- משך ומרווח בין צירים
- עוצמה 1–5 אחרי ציר
- ביטול ציר פתוח וביטול אחרון
- שמירה מקומית על השעון
- עברית + אנגלית לפי שפת השעון
- APK: `tzarim-wear-*.apk` בכל ריליז

## מה עדיין לא

- Tile על פני השעון (הוסר כי שבר את הבילד)
- סנכרון אמיתי לטלפון — יש תור אירועים בצד השעון, והטלפון רק מסמן שקיבל. האפליקציה בטלפון עדיין לא מעדכנת צירים משם
- Complications
- Google Play כ־Wear app

## מבנה הקוד

```
android/wear/src/main/java/il/tzarim/watch/
  MainActivity.kt      כניסה
  WatchApp.kt          מסך
  WatchViewModel.kt    פעולות
  domain/              מודל ציר / סשן
  data/                שמירה מקומית + תור סנכרון
```

הטלפון: `WearSyncListenerService` + `WearSyncEventStore` — שלד בלבד.

## איך ממשיכים לבנות

המשך עבודה על השעון בבראנץ' `wear`, לא ב־`main`.

`main` מקבל רק מנות שעובדות (בילד ירוק + APK).
לא דוחפים קומיט-פר-שורה ל־main — זה מה שמילא את Actions בעשרות כשלונות.

```
git checkout wear
# ... עבודה ...
# כשמוכן: PR / merge ל-main, ואז תג vX.Y.Z לריליז
```

בילד מקומי:

```
cd android
./gradlew :wear:assembleDebug
```
