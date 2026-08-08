import type { PhoneCategory } from '@/lib/types'

export type Locale = 'ar' | 'en'

// An explicit interface (plain `string` fields) instead of `as const` +
// `typeof dictionaries.ar` — the latter infers literal types from the
// Arabic strings specifically (e.g. exploreNow: "استكشف الهواتف"), so the
// English dictionary's different literal strings fail to satisfy it. This
// interface is the actual shape both languages must match.
export interface Dictionary {
  nav: {
    home: string
    phones: string
    compare: string
    ai: string
    mainNav: string
    mobileNav: string
    openMenu: string
    closeMenu: string
  }
  featuresSection: {
  items: { title: string; description: string }[]
}
  common: {
    exploreNow: string
    compareNow: string
    clearSelection: string
    loading: string
    pickOneMore: string
    back: string
  }
     

    hero: {
  badge: string
  title: string
  description: string
  description2: string
  description3: string

  statsPhones: string
  statsBrands: string
  statsCompare: string
  statsUpdated: string
  

  exploreCta: string
  aiCta: string
  featureSupported: string
  featureAccuracy: string
  featureUpdate: string
}

  categories: Record<PhoneCategory, string>
  categoryNav: {
    title: string
    subtitle: string
    descriptions: Record<PhoneCategory, string>
  }
  aiTeaser: {
    title: string
    description: string
    budgetLabel: string
    budgetPlaceholder: string
    usageLabel: string
    usageTypes: { camera: string; gaming: string; battery: string; value: string }
    ctaIdle: string
    ctaLoading: string
    errorBudget: string
    errorNoMatch: string
    errorGeneric: string
    loadingHint: string
    resultLabel: string
    viewDetails: string
    emptyHint: string
  }
  statsSection: {
    phonesLabel: string
    phonesHint: string
    filtersValue: string
    filtersLabel: string
    filtersHint: string
    scoreHint: string
    compareValue: string
    compareLabel: string
    compareHint: string
  }
  featuredPhones: {
    title: string
    subtitle: string
    viewAll: string
  }
  editorialPicks: {
    title: string
    subtitle: string
    detailsCta: string
  }
  siteFooter: {
    description: string
    rights: string
  }
  mobileNav: {
    ariaLabel: string
    compare: string
    more: string
  }
  phoneCard: {
    viewDetailsAria: string
    detailsCta: string
    compareAdd: string
    compareRemove: string
  }
  phonesPage: {
    title: string
    subtitle: string
    filtersTitle: string
    clearAll: string
    searchLabel: string
    searchPlaceholder: string
    brandLabel: string
    allBrands: string
    categoryLabel: string
    allCategories: string
    maxPriceLabel: string
    maxPricePlaceholder: string
    minRamLabel: string
    minStorageLabel: string
    has5gOnly: string
    sortLabel: string
    sortOptions: { scoreDesc: string; scoreAsc: string; priceAsc: string; priceDesc: string }
    resultsLabel: string
    loadingResults: string
    loadingCatalog: string
    errorLoading: string
    emptyResults: string
  }
  phoneDetails: {
    notFoundTitle: string
    notFoundDescription: string
    backToPhones: string
    ratingBreakdown: string
    fullSpecs: string
    strengths: string
    weaknesses: string
    ratingLabels: {
      performance: string
      camera: string
      battery: string
      display: string
      value: string
    }
    specLabels: {
      display: string
      chipset: string
      ram: string
      storage: string
      battery: string
      mainCamera: string
      os: string
      releaseYear: string
    }
  }
}

// NOTE: this is a starter set covering the strings from the files we've
// reviewed together so far (hero, categories, common actions). It's meant
// to grow incrementally — every time we go through another component
// (site-header, phone-card, etc.), add its strings here under a new key,
// then swap the component's hardcoded Arabic for `dict.<section>.<key>`.
export const dictionaries: Record<Locale, Dictionary> = {
  ar: {
    nav: {
      home: 'الرئيسية',
      phones: 'الهواتف',
      compare: 'المقارنة',
      ai: 'ABDOU AI',
      mainNav: 'التنقل الرئيسي',
      mobileNav: 'التنقل للجوال',
      openMenu: 'فتح القائمة',
      closeMenu: 'إغلاق القائمة',
    },
    common: {
      exploreNow: 'استكشف الهواتف',
      compareNow: 'قارن الآن',
      clearSelection: 'إلغاء التحديد',
      loading: 'جارٍ التحميل...',
      pickOneMore: 'اختر هاتفًا واحدًا آخر على الأقل',
      back: 'رجوع',
    },
    hero: {
      badge: 'منصة اكتشاف الهواتف الأولى في الجزائر',
      title: 'هاتفك القادم يبدأ من هنا',
      description:
        'اكتشف، فلتر، وقارن الهواتف الذكية واختر الأنسب لك بناءً على بيانات حقيقية و ABDOU SCORE — تقييم شامل يجمع الأداء والكاميرا والبطارية والقيمة مقابل السعر.',
        description2:
  'ابحث بين مئات الهواتف، وقارن المواصفات بالتفصيل، واعرف أفضل قيمة مقابل السعر قبل اتخاذ قرار الشراء.',

description3:
  'يتم تحديث الأسعار والمواصفات باستمرار لتمنحك تجربة بحث احترافية شبيهة بأفضل مواقع الهواتف العالمية.',
      exploreCta: 'استكشف الهواتف',
      aiCta: 'جرب ABDOU AI',
      featureSupported: 'هاتف مدعوم',
      featureAccuracy: 'دقة عالية بالتقييمات',
      featureUpdate: 'تحديث يومي للأسعار',
      statsPhones: 'هاتف متوفر',
      statsBrands: 'علامة تجارية',
      statsCompare: 'مقارنة ذكية',
      statsUpdated: 'آخر تحديث',
    },
    categories: {
      Flagship: 'رائد',
      'Upper Mid-Range': 'متوسط عالي',
      'Mid-Range': 'متوسط',
      Budget: 'اقتصادي',
    },
    categoryNav: {
      title: 'تصفّح حسب الفئة',
      subtitle: 'اختر فئتك السعرية وابدأ الاكتشاف',
      descriptions: {
        Flagship: 'أقوى الهواتف بأحدث التقنيات',
        'Upper Mid-Range': 'أداء ممتاز بسعر أذكى',
        'Mid-Range': 'توازن مثالي بين السعر والمواصفات',
        Budget: 'أفضل قيمة مقابل كل دينار',
      },
    },

    featuresSection: {
  items: [
    { title: 'تقييم ABDOU SCORE', description: 'تقييم شامل يعتمد على الأداء، الكاميرا، البطارية والقيمة مقابل السعر.' },
    { title: 'مقارنة ذكية بالذكاء الاصطناعي', description: 'قارن حتى 3 هواتف في نفس الوقت واحصل على توصية فورية.' },
    { title: 'بيانات دقيقة ومحدثة', description: 'أسعار ومواصفات محدّثة باستمرار من مصادر موثوقة.' },
    { title: 'منصة مستقلة وموثوقة', description: 'تجربة خالية من الإعلانات المزعجة، بمحتوى مستقل وجيّد.' },
  ],
},
    aiTeaser: {
      title: 'دع الذكاء الاصطناعي يختار لك',
      description:
        'أدخل ميزانيتك ونوع استخدامك، وسيقترح ABDOU AI الهاتف الأنسب لك من قاعدة بياناتنا اعتماداً على ABDOU SCORE والقيمة مقابل السعر.',
      budgetLabel: 'الميزانية (دج)',
      budgetPlaceholder: 'مثال: 100000',
      usageLabel: 'نوع الاستخدام',
      usageTypes: {
        camera: 'التصوير',
        gaming: 'الألعاب',
        battery: 'البطارية',
        value: 'القيمة',
      },
      ctaIdle: 'دع ABDOU AI يساعدك',
      ctaLoading: 'جارٍ التحليل...',
      errorBudget: 'أدخل ميزانية صحيحة أكبر من صفر.',
      errorNoMatch: 'لا يوجد هاتف يطابق ميزانيتك ونوع استخدامك. جرّب رفع الميزانية.',
      errorGeneric: 'تعذّر جلب التوصية حالياً. تحقق من اتصالك وحاول مجدداً.',
      loadingHint: 'عبدو يحلّل الهواتف المناسبة لميزانيتك واستخدامك...',
      resultLabel: 'توصية ABDOU AI ضمن ميزانيتك',
      viewDetails: 'عرض التفاصيل الكاملة',
      emptyHint: 'أدخل تفضيلاتك واضغط الزر لتظهر توصية عبدو الذكية هنا.',
    },
    statsSection: {
      phonesLabel: 'هاتف ذكي',
      phonesHint: 'قاعدة بيانات تنمو باستمرار',
      filtersValue: 'فلاتر',
      filtersLabel: 'ذكية',
      filtersHint: 'حسب السعر والفئة والعلامة',
      scoreHint: 'تقييم موحّد من 10',
      compareValue: 'قارن',
      compareLabel: 'الهواتف',
      compareHint: 'مقارنة جنباً إلى جنب',
    },
    featuredPhones: {
      title: 'هواتف مميزة',
      subtitle: 'الأعلى تقييماً حسب ABDOU SCORE',
      viewAll: 'عرض الكل',
    },
    editorialPicks: {
      title: 'اختيارات عبدو',
      subtitle: 'توصيات مختارة بعناية لكل احتياج',
      detailsCta: 'التفاصيل',
    },
    siteFooter: {
      description: 'منصة ABDOU GSM لاكتشاف الهواتف الذكية في الجزائر — قرارات أذكى ببيانات حقيقية.',
      rights: 'جميع الحقوق محفوظة.',
    },
    mobileNav: {
      ariaLabel: 'التنقل السفلي',
      compare: 'مقارنة',
      more: 'المزيد',
    },
    phoneCard: {
      viewDetailsAria: 'عرض تفاصيل',
      detailsCta: 'التفاصيل',
      compareAdd: 'إضافة',
      compareRemove: 'إزالة',
    },
    phonesPage: {
      title: 'كل الهواتف',
      subtitle: 'تصفح القائمة الكاملة من قاعدة بيانات ABDOU GSM الحيّة',
      filtersTitle: 'الفلاتر',
      clearAll: 'مسح الكل',
      searchLabel: 'البحث',
      searchPlaceholder: 'ابحث عن هاتف أو علامة...',
      brandLabel: 'العلامة التجارية',
      allBrands: 'كل العلامات',
      categoryLabel: 'الفئة',
      allCategories: 'كل الفئات',
      maxPriceLabel: 'الحد الأقصى للسعر (دج)',
      maxPricePlaceholder: 'مثال: 100000',
      minRamLabel: 'RAM أدنى (GB)',
      minStorageLabel: 'تخزين أدنى (GB)',
      has5gOnly: 'يدعم 5G فقط',
      sortLabel: 'الترتيب',
      sortOptions: {
        scoreDesc: 'الأعلى تقييماً',
        scoreAsc: 'الأقل تقييماً',
        priceAsc: 'الأقل سعراً',
        priceDesc: 'الأعلى سعراً',
      },
      resultsLabel: 'هاتف',
      loadingResults: 'جارٍ التحميل...',
      loadingCatalog: 'جارٍ تحميل الهواتف من قاعدة البيانات...',
      errorLoading: 'تعذر تحميل الهواتف حالياً. تحقق من الاتصال وحاول مجدداً.',
      emptyResults: 'لا توجد هواتف مطابقة لهذه الفلاتر. جرّب تعديلها.',
    },
    phoneDetails: {
      notFoundTitle: 'لم يتم العثور على هذا الهاتف',
      notFoundDescription:
        'ربما تم حذف الهاتف أو أن الرابط غير صحيح. جرّب العودة إلى قائمة الهواتف الكاملة.',
      backToPhones: 'رجوع إلى الهواتف',
      ratingBreakdown: 'تفصيل التقييم',
      fullSpecs: 'المواصفات الكاملة',
      strengths: 'نقاط القوة',
      weaknesses: 'نقاط تستحق الانتباه',
      ratingLabels: {
        performance: 'الأداء',
        camera: 'الكاميرا',
        battery: 'البطارية',
        display: 'الشاشة',
        value: 'القيمة',
      },
      specLabels: {
        display: 'الشاشة',
        chipset: 'المعالج',
        ram: 'الذاكرة العشوائية (RAM)',
        storage: 'التخزين',
        battery: 'البطارية',
        mainCamera: 'الكاميرا الرئيسية',
        os: 'نظام التشغيل',
        releaseYear: 'سنة الإصدار',
      },
    },
  },
  en: {
    nav: {
      home: 'Home',
      phones: 'Phones',
      compare: 'Compare',
      ai: 'ABDOU AI',
      mainNav: 'Main navigation',
      mobileNav: 'Mobile navigation',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
    },
    featuresSection: {
      items: [
        { title: 'ABDOU SCORE Rating', description: 'A comprehensive rating based on performance, camera, battery, and value for money.' },
        { title: 'Smart AI Comparison', description: 'Compare up to 3 phones at once and get an instant recommendation.' },
        { title: 'Accurate, Updated Data', description: 'Prices and specs continuously updated from trusted sources.' },
        { title: 'Independent & Trustworthy', description: 'An experience free of intrusive ads, with independent, quality content.' },
      ],
    },
    common: {
      exploreNow: 'Explore Phones',
      compareNow: 'Compare Now',
      clearSelection: 'Clear Selection',
      loading: 'Loading...',
      pickOneMore: 'Pick at least one more phone',
      back: 'Back',
    },
    hero: {
      badge: "Algeria's #1 phone discovery platform",
      title: 'Your next phone starts here',
      description:
        'Discover, filter, and compare smartphones and pick the right one for you based on real data and ABDOU SCORE — a comprehensive rating combining performance, camera, battery, and value for money.',
        description2:
  'Search hundreds of smartphones, compare detailed specifications, and discover the best value before buying.',

description3:
  'Prices and specifications are continuously updated to deliver a professional experience similar to the worlds leading smartphone platforms.',
      exploreCta: 'Explore Phones',
      aiCta: 'Try ABDOU AI',
      featureSupported: 'phones supported',
      featureAccuracy: 'High-accuracy ratings',
      featureUpdate: 'Daily price updates',
      statsPhones: 'Smartphones',
      statsBrands: 'Brands',
      statsCompare: 'AI Comparison',
      statsUpdated: 'Updated',
    
    },
    categories: {
      Flagship: 'Flagship',
      'Upper Mid-Range': 'Upper Mid-Range',
      'Mid-Range': 'Mid-Range',
      Budget: 'Budget',
    },
    categoryNav: {
      title: 'Browse by Category',
      subtitle: 'Pick your price range and start discovering',
      descriptions: {
        Flagship: 'The most powerful phones with the latest tech',
        'Upper Mid-Range': 'Excellent performance at a smarter price',
        'Mid-Range': 'The perfect balance of price and specs',
        Budget: 'The best value for every dinar',
      },
    },
    aiTeaser: {
      title: 'Let AI choose for you',
      description:
        'Enter your budget and usage type, and ABDOU AI will suggest the best phone for you from our database based on ABDOU SCORE and value for money.',
      budgetLabel: 'Budget (DZD)',
      budgetPlaceholder: 'e.g. 100000',
      usageLabel: 'Usage type',
      usageTypes: {
        camera: 'Camera',
        gaming: 'Gaming',
        battery: 'Battery',
        value: 'Value',
      },
      ctaIdle: 'Let ABDOU AI help you',
      ctaLoading: 'Analyzing...',
      errorBudget: 'Enter a valid budget greater than zero.',
      errorNoMatch: 'No phone matches your budget and usage type. Try raising your budget.',
      errorGeneric: 'Could not fetch a recommendation right now. Check your connection and try again.',
      loadingHint: 'Abdou is analyzing phones that fit your budget and usage...',
      resultLabel: 'ABDOU AI recommendation within your budget',
      viewDetails: 'View full details',
      emptyHint: 'Enter your preferences and click the button to see ABDOU AI’s smart pick here.',
    },
    statsSection: {
      phonesLabel: 'smartphones',
      phonesHint: 'An ever-growing database',
      filtersValue: 'Filters',
      filtersLabel: 'Smart',
      filtersHint: 'By price, category, and brand',
      scoreHint: 'A unified rating out of 10',
      compareValue: 'Compare',
      compareLabel: 'phones',
      compareHint: 'Side-by-side comparison',
    },
    featuredPhones: {
      title: 'Featured Phones',
      subtitle: 'Highest rated by ABDOU SCORE',
      viewAll: 'View All',
    },
    editorialPicks: {
      title: "Abdou's Picks",
      subtitle: 'Carefully selected recommendations for every need',
      detailsCta: 'Details',
    },
    siteFooter: {
      description: 'ABDOU GSM — discover smartphones in Algeria, smarter decisions with real data.',
      rights: 'All rights reserved.',
    },
    mobileNav: {
      ariaLabel: 'Bottom navigation',
      compare: 'Compare',
      more: 'More',
    },
    phoneCard: {
      viewDetailsAria: 'View details for',
      detailsCta: 'Details',
      compareAdd: 'Compare',
      compareRemove: 'Remove',
    },
    phonesPage: {
      title: 'All Phones',
      subtitle: 'Browse the full catalog from the live ABDOU GSM database',
      filtersTitle: 'Filters',
      clearAll: 'Clear All',
      searchLabel: 'Search',
      searchPlaceholder: 'Search for a phone or brand...',
      brandLabel: 'Brand',
      allBrands: 'All Brands',
      categoryLabel: 'Category',
      allCategories: 'All Categories',
      maxPriceLabel: 'Max Price (DZD)',
      maxPricePlaceholder: 'e.g. 100000',
      minRamLabel: 'Min RAM (GB)',
      minStorageLabel: 'Min Storage (GB)',
      has5gOnly: '5G only',
      sortLabel: 'Sort By',
      sortOptions: {
        scoreDesc: 'Highest Rated',
        scoreAsc: 'Lowest Rated',
        priceAsc: 'Price: Low to High',
        priceDesc: 'Price: High to Low',
      },
      resultsLabel: 'phones',
      loadingResults: 'Loading...',
      loadingCatalog: 'Loading phones from the database...',
      errorLoading: 'Could not load phones right now. Check your connection and try again.',
      emptyResults: 'No phones match these filters. Try adjusting them.',
    },
    phoneDetails: {
      notFoundTitle: 'This phone could not be found',
      notFoundDescription:
        'It may have been removed, or the link is incorrect. Try going back to the full phone list.',
      backToPhones: 'Back to Phones',
      ratingBreakdown: 'Rating Breakdown',
      fullSpecs: 'Full Specifications',
      strengths: 'Strengths',
      weaknesses: 'Worth Noting',
      ratingLabels: {
        performance: 'Performance',
        camera: 'Camera',
        battery: 'Battery',
        display: 'Display',
        value: 'Value',
      },
      specLabels: {
        display: 'Display',
        chipset: 'Chipset',
        ram: 'RAM',
        storage: 'Storage',
        battery: 'Battery',
        mainCamera: 'Main Camera',
        os: 'OS',
        releaseYear: 'Release Year',
      },
    },
  },
}