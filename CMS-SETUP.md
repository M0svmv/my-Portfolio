# إدارة محتوى البورتفوليو (مجاناً)

كل المحتوى اللي بيتغير موجود في ملفات JSON داخل `src/content/`:

| الملف | فيه إيه |
|---|---|
| `profile.json` | الاسم، الوظيفة، الصورة، النبذة، فقرات About، الـ facts، الكلمات اللي بتتغير في الـ hero، شارة "Open to work"، نص التواصل، لينك الـ CV، يوزر GitHub، نص مقدمة اللعبة |
| `skills.json` | المهارات (اسم، مجموعة، أيقونة، لون، وصف) |
| `services.json` | قسم "What I can do for you" |
| `socials.json` | لينكات التواصل (وأنهي واحدة تظهر كأيقونة سريعة فوق) |
| `projects.json` | التحكم في المشاريع: إخفاء ريبو، تثبيته فوق، تغيير عنوانه/وصفه/صورته، وإضافة مشاريع بإيدك |

تقدر تعدّل الملفات دي بإيدك، أو من **لوحة التحكم** على `/admin` (Decap CMS — مجاني ومفتوح المصدر).
كل مرة تدوس **Publish** في اللوحة بيتعمل commit على GitHub، و Netlify بيعمل build للموقع لوحده في حوالي دقيقة.

---

## الإعداد (مرة واحدة بس)

### 1. ارفع الكود على GitHub
لازم الكود الجديد يكون على branch اسمه `main` في `M0svmv/my-Portfolio`، والموقع شغال على Netlify من نفس الريبو
(إعدادات الـ build موجودة في `netlify.toml`).

### 2. اعمل GitHub OAuth App
1. GitHub ← **Settings** ← **Developer settings** ← **OAuth Apps** ← **New OAuth App**
2. املأ:
   - **Application name:** `Portfolio CMS`
   - **Homepage URL:** `https://mohamedosama3000.netlify.app`
   - **Authorization callback URL:** `https://api.netlify.com/auth/done`
3. دوس **Register application**، انسخ الـ **Client ID**، وبعدين دوس **Generate a new client secret** وانسخه.

### 3. وصّله بـ Netlify
Netlify ← الموقع بتاعك ← **Site configuration** ← **Access & security** ← **OAuth** ←
**Install provider** ← اختار **GitHub** ← حط الـ Client ID والـ Client Secret ← **Install**.

### 4. جرّب
افتح `https://mohamedosama3000.netlify.app/admin` ← **Login with GitHub** ← عدّل أي حاجة ← **Publish**.

> لو غيّرت اسم الريبو أو الدومين، عدّل `repo` و `site_url` في `public/admin/config.yml`.

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
