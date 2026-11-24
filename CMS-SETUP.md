# إدارة محتوى البورتفوليو (مجاناً) — على Vercel

كل المحتوى اللي بيتغير موجود في ملفات JSON داخل `src/content/`:

| الملف | فيه إيه |
|---|---|
| `profile.json` | الاسم، الوظيفة، الصورة، النبذة، فقرات About، الـ facts، الكلمات اللي بتتغير في الـ hero، شارة "Open to work"، نص التواصل، لينك الـ CV، يوزر GitHub، نص مقدمة اللعبة |
| `skills.json` | المهارات (اسم، مجموعة، أيقونة، لون، وصف) |
| `services.json` | قسم "What I can do for you" |
| `socials.json` | لينكات التواصل (وأنهي واحدة تظهر كأيقونة سريعة فوق) |
| `projects.json` | التحكم في المشاريع: إخفاء ريبو، تثبيته فوق، تغيير عنوانه/وصفه/صورته، وإضافة مشاريع بإيدك |

تقدر تعدّلها من **لوحة التحكم** على `/admin` (Decap CMS — مجاني ومفتوح المصدر).
كل مرة تدوس **Publish** بيتعمل commit على GitHub، و Vercel بيعمل deploy للموقع لوحده في حوالي دقيقة.
تسجيل الدخول بيتم عن طريق function صغيرة على Vercel نفسه (`api/auth.js` و `api/callback.js`) — مفيش أي خدمة خارجية.

---

## الإعداد (مرة واحدة بس)

### 1. اربط الريبو بـ Vercel
1. ادخل [vercel.com/new](https://vercel.com/new) وسجّل دخول بـ GitHub.
2. اختار الريبو `M0svmv/my-Portfolio` ← **Import**.
3. سيب الإعدادات زي ما هي (Vercel هيقرا `vercel.json`: Vite، الأمر `npm run build`، والمجلد `dist`) ← **Deploy**.
4. بعد ما يخلص، انسخ دومين الموقع، مثلاً `https://my-portfolio-xxxx.vercel.app`.

### 2. اعمل GitHub OAuth App
1. GitHub ← **Settings** ← **Developer settings** ← **OAuth Apps** ← **New OAuth App**
2. املأ:
   - **Application name:** `Portfolio CMS`
   - **Homepage URL:** دومين Vercel بتاعك
   - **Authorization callback URL:** `https://<دومين-Vercel-بتاعك>/api/callback`
3. **Register application** ← انسخ الـ **Client ID** ← دوس **Generate a new client secret** وانسخه.

### 3. حط الـ env variables في Vercel
Vercel ← المشروع ← **Settings** ← **Environment Variables** ← ضيف:

| Name | Value |
|---|---|
| `GITHUB_CLIENT_ID` | الـ Client ID |
| `GITHUB_CLIENT_SECRET` | الـ Client Secret |
| `GITHUB_OAUTH_SCOPE` *(اختياري)* | سيبه فاضي لو الريبو public. لو خليته private حط `repo,user` |

بعدها: **Deployments** ← آخر deployment ← **⋯** ← **Redeploy** (عشان الـ variables تتقري).

> ⚠️ الـ Client Secret سر — متحطوش في الكود ولا في أي ملف، بس في Vercel.

### 4. جرّب
افتح `https://<دومين-Vercel-بتاعك>/admin` ← **Login with GitHub** ← وافق ← عدّل أي حاجة ← **Publish**.

> لو غيّرت الدومين بعدين (مثلاً دومين خاص)، غيّر الـ **callback URL** في الـ OAuth App بتاع GitHub بنفس الدومين الجديد.
> لو غيّرت اسم الريبو، عدّله في `public/admin/index.html` و `public/admin/config.yml`.

---

## تعديل محلي (من غير لوجين)

```bash
npm run dev     # الموقع
npm run cms     # سيرفر Decap المحلي
```
وبعدين افتح `http://localhost:5173/admin/index.html` — التعديلات هتتحفظ في ملفاتك على الجهاز على طول.

---

## ملاحظات

- **الأيقونات:** بتختارها بالاسم من قايمة (react, nodejs, mongodb, linkedin, x, whatsapp …). عايز أيقونة مش موجودة؟ ضيف سطر في `src/data/icons.js`، وضيف نفس الاسم في قوائم `options` بتاعة الأيقونات في `public/admin/config.yml`.
- **الصور** اللي بترفعها من اللوحة بتتحفظ في `public/img/uploads/`.
- **المشاريع:** اسم الريبو لازم يتكتب زي ما هو على GitHub بالظبط (مثلاً `weather-app`).
- المهارات اللي بتضيفها بتظهر في الصفحة الاحترافية **وكمان** في كروت اللعبة تلقائياً.
- `netlify.toml` لسه موجود لو حبيت ترجع لـ Netlify، ومش بيأثر على Vercel.
