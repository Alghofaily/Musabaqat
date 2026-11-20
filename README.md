# مسابقات

مجموعة ألعاب مسابقات للفرق تعمل في المتصفح مباشرة، دون إنترنت ودون تثبيت أي برنامج. كل لعبة في مجلد مستقل بذاته.

## العب الآن دون تنزيل

- [سوق المعرفة](https://alghofaily.github.io/Musabaqat/souq-al-marifa/)
- [ورقة الحظ](https://alghofaily.github.io/Musabaqat/waraqat-al-hazz/)
- [حصون المعرفة](https://alghofaily.github.io/Musabaqat/husun-al-marifa/)

## الألعاب

<div dir="rtl">

| الشعار | اللعبة | المجلد | الوصف |
|:---:|---|---|---|
| <img src="souq-al-marifa/assets/favicon.svg" width="48" height="48" alt="شعار سوق المعرفة"> | سوق المعرفة | [`souq-al-marifa`](souq-al-marifa/) | مسابقة معلومات للفرق على شاشة تداول أسهم حية: الإجابة الصحيحة تكسب المال، والمال يُستثمر في السوق، والفريق الأغنى يفوز. |
| <img src="waraqat-al-hazz/assets/favicon.svg" width="48" height="48" alt="شعار ورقة الحظ"> | ورقة الحظ | [`waraqat-al-hazz`](waraqat-al-hazz/) | مسابقة على طريقة البرامج التلفزيونية: اختر مستوى سؤالك، أجب صحيحاً، ثم اقلب ورقة حظ قد تربحك ألف درجة أو تضرب بها الفرق الأخرى. |
| <img src="husun-al-marifa/assets/favicon.svg" width="48" height="48" alt="شعار حصون المعرفة"> | حصون المعرفة | [`husun-al-marifa`](husun-al-marifa/) | حرب معلومات للفرق على خريطة سداسية: الإجابة الصحيحة تكسب المال، والمال يشتري كتائب ومدافع وحصوناً، والمعارك تُحسم بأسئلة متتالية حتى تسقط العواصم. |

</div>

## طريقة تنزيل لعبة

### الطريقة الأولى: ملف ZIP (الأسهل)

1. نزّل المستودع كاملاً من هذا الرابط:
   [Musabaqat-main.zip](https://github.com/Alghofaily/Musabaqat/archive/refs/heads/main.zip)
   (أو من صفحة المستودع: زر **Code** الأخضر ثم **Download ZIP**).
2. فك ضغط الملف.
3. افتح مجلد اللعبة التي تريدها، مثل `souq-al-marifa`.
4. افتح الملف `index.html` بالنقر المزدوج، فتعمل اللعبة في المتصفح.

يكفي نسخ مجلد اللعبة وحده إلى أي جهاز آخر أو ذاكرة فلاش، فكل لعبة لا تحتاج إلى شيء خارج مجلدها.

### الطريقة الثانية: تنزيل لعبة واحدة فقط بـ git

لمن يستخدم git، تنزّل هذه الأوامر مجلد لعبة واحدة دون بقية الألعاب (استبدل `souq-al-marifa` باسم مجلد اللعبة):

```bash
git clone --filter=blob:none --sparse https://github.com/Alghofaily/Musabaqat.git
cd Musabaqat
git sparse-checkout set souq-al-marifa
```

ثم افتح `souq-al-marifa/index.html` في المتصفح.

## المتطلبات

- متصفح حديث: Chrome أو Edge أو Firefox أو Safari.
- يُفضَّل عرض اللعبة على شاشة كبيرة أو جهاز عرض، فالمقدّم يدير اللعبة والفرق تشاهد.
- لا يلزم اتصال بالإنترنت.

## ملاحظة عن حفظ البيانات

تحفظ كل لعبة إعداداتها وبنك أسئلتها في المتصفح نفسه على الجهاز نفسه. إذا فتحت اللعبة من متصفح أو جهاز آخر فستبدأ بالأسئلة الأصلية، ويمكنك استيراد أسئلتك من ملف CSV مرة أخرى.
