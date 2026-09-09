# הוצאה לגוגל פליי

האפליקציה מוכנה טכנית לחנות. את חשבון המפתח והקונסול אי אפשר לפתוח במקומך.

## מה כבר מוכן

- מזהה: `il.tzarim.app`
- מדיניות פרטיות: [privacy.html](https://pinywinner.github.io/tzarim/privacy.html)
- קישור פרטיות בתוך האפליקציה (הגדרות)
- טקסט חנות: `docs/play-listing.md`
- AAB חתום ב-Release של GitHub, אם ה-keystore נשמר ב-Secrets

## מה שאתה עושה בקונסול

1. [Google Play Console](https://play.google.com/console) — חשבון מפתח, תשלום חד-פעמי $25, ואימות זהות.
2. Create app → אפליקציה, חינמית, קטגוריה **Parenting**.
3. מדיניות פרטיות: כתובת ה-URL למעלה.
4. Data safety: לא נאסף כלום, לא משותף כלום.
5. App content: בלי פרסומות. הצהרת בריאות: **לא מכשיר רפואי**.
6. העלאת AAB ל-Closed testing (לא APK).
7. אם החשבון אישי ונפתח אחרי נובמבר 2023: **12 בודקים ל-14 ימים רצופים**, ואז בקשה לייצור.
8. צילומי מסך לטלפון (לפחות 2) + Feature graphic 1024×500 מתיקיית `docs/play/`.

## חתימה

ה-upload key חייב להישמר אצלך לנצח. בלי הקובץ הזה אי אפשר לעדכן את האפליקציה בחנות.

Secrets בגיטהאב:

- `TZARIM_KEYSTORE_BASE64`
- `TZARIM_KEYSTORE_PASSWORD`
- `TZARIM_KEY_ALIAS`
- `TZARIM_KEY_PASSWORD`

## אזהרה חשובה

זו לא אפליקציה רפואית. אם פליי יסווג אותה כ-Medical ולא Parenting, ייתכן שיידרש חשבון ארגון. לכן הקטגוריה חייבת להיות Parenting, והדיסקליימר חייב להופיע בתיאור.
