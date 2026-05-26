"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ar" | "ru" | "zh" | "hi";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    isRTL: boolean;
    t: (key: string, section?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, any> = {
    en: {
        common: {
            bookNow: "Book Now",
            seeDetails: "See Details",
            reviews: "Reviews",
            journal: "Journal",
            about: "About",
            contact: "Contact",
            myBookings: "My Bookings",
            logout: "Logout",
            login: "Login",
            signup: "Sign Up",
            total: "Total",
            confirm: "Confirm",
            yourBooking: "Your Booking",
            viewDetails: "View Details",
            aiPlanner: "AI Trip Planner",
        },
        details: {
            freeCancellation: "Free Cancellation",
            mobileVoucher: "Mobile Voucher",
            instantConfirmation: "Instant Confirmation",
            highlights: "Highlights",
            included: "What's Included",
            notIncluded: "Not Included",
            safety: "Safety & Restrictions",
            bring: "What to Bring",
            selectDate: "Select Date",
            selectTime: "Select TimeSlot",
            bookNow: "Book Now",
        },
        home: {
            heroTitle: "Experience the Extraordinary",
            heroSubtitle: "Curated luxury adventures in the heart of the Arabian desert.",
            heroDesc1: "Book the finest desert safaris and outdoor experiences in Dubai.",
            heroDesc2: "Where golden dunes meet unforgettable memories.",
            explorePackages: "EXPLORE PACKAGES",
            ourStory: "OUR STORY",
        },
        about: {
            title: "About Dubai Adventures",
            heading: "Why Travelers Choose Dubai Adventures",
            subheading: "Luxury desert experiences, handled properly from first click to final drop-off.",
            description: "We build premium Dubai outdoor experiences with licensed operators, smooth logistics, fast confirmations, and support that stays clear before and after your booking.",
            guests: "Guests Hosted",
            packages: "Curated Packages",
            rating: "Average Rating",
        },
        footer: {
            desc: "Dubai's premier outdoor adventure company. Crafting luxury desert safaris and exclusive experiences for discerning travelers since 2014.",
            experiences: "Experiences",
            company: "Company",
            contactUs: "Contact us",
            rights: "All rights reserved.",
        }
    },
    ar: {
        common: {
            bookNow: "احجز الآن",
            seeDetails: "شاهد التفاصيل",
            reviews: "المراجعات",
            journal: "المجلة",
            about: "حول",
            contact: "اتصل بنا",
            myBookings: "حجوزاتي",
            logout: "تسجيل الخروج",
            login: "تسجيل الدخول",
            signup: "إنشاء حساب",
            total: "المجموع",
            confirm: "تأكيد",
            yourBooking: "حجزك",
            viewDetails: "عرض التفاصيل",
            aiPlanner: "مخطط الرحلة بالذكاء الاصطناعي",
        },
        details: {
            freeCancellation: "إلغاء مجاني",
            mobileVoucher: "قسيمة موبايل",
            instantConfirmation: "تأكيد فوري",
            highlights: "أبرز المعالم",
            included: "ما الذي يشتمل عليه",
            notIncluded: "غير مشمول",
            safety: "السلامة والقيود",
            bring: "ماذا تحضر معك",
            selectDate: "اختر التاريخ",
            selectTime: "اختر الوقت",
            bookNow: "احجز الآن",
        },
        home: {
            heroTitle: "اكتشف الاستثنائي",
            heroSubtitle: "مغامرات فاخرة منسقة في قلب الصحراء العربية.",
            heroDesc1: "احجز أفضل رحلات السفاري الصحراوية والتجارب الخارجية في دبي.",
            heroDesc2: "حيث تلتقي الكثبان الذهبية بالذكريات التي لا تنسى.",
            explorePackages: "استكشف الباقات",
            ourStory: "قصتنا",
        },
        about: {
            title: "عن دبي أدفنتشرز",
            heading: "لماذا يختار المسافرون دبي أدفنتشرز",
            subheading: "تجارب صحراوية فاخرة، يتم التعامل معها بشكل صحيح من أول نقرة حتى التوصيل النهائي.",
            description: "نحن نبني تجارب دبي الخارجية المتميزة مع مشغلين مرخصين، ولوجستيات سلسة، وتأكيدات سريعة، ودعم يظل واضحًا قبل وبعد الحجز.",
            guests: "ضيوف تمت استضافتهم",
            packages: "باقات منسقة",
            rating: "متوسط التقييم",
        },
        footer: {
            desc: "شركة المغامرات الخارجية الرائدة في دبي. صياغة رحلات سفاري صحراوية فاخرة وتجارب حصرية للمسافرين المتميزين منذ عام 2014.",
            experiences: "تجارب",
            company: "شركة",
            contactUs: "اتصل بنا",
            rights: "كل الحقوق محفوظة.",
        }
    },
    ru: {
        common: {
            bookNow: "Забронировать",
            seeDetails: "Подробнее",
            reviews: "Отзывы",
            journal: "Журнал",
            about: "О нас",
            contact: "Контакт",
            myBookings: "Мои бронирования",
            logout: "Выйти",
            login: "Войти",
            signup: "Регистрация",
            total: "Итого",
            confirm: "Подтвердить",
            yourBooking: "Ваше бронирование",
            viewDetails: "Посмотреть детали",
            aiPlanner: "ИИ Планировщик",
        },
        details: {
            freeCancellation: "Бесплатная отмена",
            mobileVoucher: "Мобильный ваучер",
            instantConfirmation: "Мгновенное подтверждение",
            highlights: "Особенности",
            included: "Что включено",
            notIncluded: "Не включено",
            safety: "Безопасность и ограничения",
            bring: "Что взять с собой",
            selectDate: "Выбрать дату",
            selectTime: "Выбрать время",
            bookNow: "Забронировать",
        },
        home: {
            heroTitle: "Испытайте необычайное",
            heroSubtitle: "Курируемые роскошные приключения в самом сердце Аравийской пустыни.",
            heroDesc1: "Бронируйте лучшие сафари по пустыне и занятия на свежем воздухе в Дубае.",
            heroDesc2: "Где золотые дюны встречаются с незабываемыми воспоминаниями.",
            explorePackages: "ИССЛЕДОВАТЬ ПАКЕТЫ",
            ourStory: "НАША ИСТОРИЯ",
        },
        about: {
            title: "О Dubai Adventures",
            heading: "Почему путешественники выбирают Dubai Adventures",
            subheading: "Роскошные приключения в пустыне, организованные должным образом от первого клика до финальной высадки.",
            description: "Мы создаем первоклассные мероприятия на свежем воздухе в Дубае с лицензированными операторами, отлаженной логистикой, быстрыми подтверждениями и поддержкой, которая остается на связи до и после вашего бронирования.",
            guests: "Принято гостей",
            packages: "Курируемые пакеты",
            rating: "Средний рейтинг",
        },
        footer: {
            desc: "Ведущая компания по организации приключений на открытом воздухе в Дубае. Создание роскошных сафари по пустыне и эксклюзивных впечатлений для взыскательных путешественников с 2014 года.",
            experiences: "Впечатления",
            company: "Компания",
            contactUs: "Связаться с нами",
            rights: "Все права защищены.",
        }
    },
    zh: {
        common: {
            bookNow: "现在预订",
            seeDetails: "查看详情",
            reviews: "评论",
            journal: "杂志",
            about: "关于",
            contact: "联系",
            myBookings: "我的预订",
            logout: "登出",
            login: "登录",
            signup: "注册",
            total: "总计",
            confirm: "确认",
            yourBooking: "您的预订",
            viewDetails: "查看详情",
            aiPlanner: "AI行程规划器",
        },
        details: {
            freeCancellation: "免费取消",
            mobileVoucher: "电子凭证",
            instantConfirmation: "立即确认",
            highlights: "亮点",
            included: "费用包含",
            notIncluded: "费用不含",
            safety: "安全与限制",
            bring: "携带物品",
            selectDate: "选择日期",
            selectTime: "选择时间",
            bookNow: "现在预订",
        },
        home: {
            heroTitle: "体验非凡",
            heroSubtitle: "阿拉伯沙漠中心的精品奢华冒险。",
            heroDesc1: "预订迪拜最好的沙漠野生动物园和户外活动。",
            heroDesc2: "金色沙丘与难忘回忆交汇之地。",
            explorePackages: "探索套餐",
            ourStory: "我们的故事",
        },
        about: {
            title: "关于迪拜大冒险",
            heading: "为什么旅行者选择迪拜大冒险",
            subheading: "奢华的沙漠体验，从第一次点击到最后送达，全程妥善处理。",
            description: "我们与获得许可的运营商合作，通过流畅的物流、快速的确认方案以及预订前后的清晰支持，打造优质的迪拜户外体验。",
            guests: "接待游客",
            packages: "精选套餐",
            rating: "平均评分",
        },
        footer: {
            desc: "迪拜领先的户外探险公司。自 2014 年起为挑剔的旅行者打造奢华的沙漠探险和独特的体验。",
            experiences: "体验项目",
            company: "关于公司",
            contactUs: "联系我们",
            rights: "版权所有。",
        }
    },
    hi: {
        common: {
            bookNow: "अभी बुक करें",
            seeDetails: "विवरण देखें",
            reviews: "समीक्षाएँ",
            journal: "जर्नल",
            about: "हमारे बारे में",
            contact: "संपर्क करें",
            myBookings: "मेरी बुकिंग",
            logout: "लॉग आउट",
            login: "लॉग इन",
            signup: "साइन अप",
            total: "कुल",
            confirm: "पुष्टि करें",
            yourBooking: "आपकी बुकिंग",
            viewDetails: "विवरण देखें",
            aiPlanner: "AI ट्रिप प्लानर",
        },
        details: {
            freeCancellation: "मुफ्त रद्दीकरण",
            mobileVoucher: "मोबाइल वाउचर",
            instantConfirmation: "त्वरित पुष्टि",
            highlights: "मुख्य विशेषताएं",
            included: "क्या शामिल है",
            notIncluded: "शामिल नहीं है",
            safety: "सुरक्षा और प्रतिबंध",
            bring: "क्या साथ लाएं",
            selectDate: "तारीख चुनें",
            selectTime: "समय चुनें",
            bookNow: "अभी बुक करें",
        },
        home: {
            heroTitle: "असाधारण का अनुभव करें",
            heroSubtitle: "अरब रेगिस्तान के मध्य में विशेष लक्जरी रोमांच।",
            heroDesc1: "दुबई में बेहतरीन डेजर्ट सफारी और आउटडोर अनुभवों को बुक करें।",
            heroDesc2: "जहाँ सुनहरे टीले अविस्मरणीय यादों से मिलते हैं।",
            explorePackages: "पैकेज देखें",
            ourStory: "हमारी कहानी",
        },
        about: {
            title: "दुबई एडवेंचर्स के बारे में",
            heading: "यात्री दुबई एडवेंचर्स को क्यों चुनते हैं",
            subheading: "लक्जरी डेजर्ट अनुभव, पहली क्लिक से लेकर अंतिम ड्रॉप-ऑफ तक सही ढंग से प्रबंधित।",
            description: "हम लाइसेंस प्राप्त ऑपरेटरों, सुचारू रसद, त्वरित पुष्टि और स्पष्ट सहायता के साथ प्रीमियम दुबई आउटडोर अनुभव प्रदान करते हैं।",
            guests: "मेहमानों की संख्या",
            packages: "विशेष पैकेज",
            rating: "औसत रेटिंग",
        },
        footer: {
            desc: "दुबई की अग्रणी आउटडोर एडवेंचर कंपनी। 2014 से समझदार यात्रियों के लिए लक्जरी डेजर्ट सफारी और विशेष अनुभव बना रहे हैं।",
            experiences: "अनुभव",
            company: "कंपनी",
            contactUs: "हमसे संपर्क करें",
            rights: "सर्वाधिकार सुरक्षित।",
        }
    }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en");

    useEffect(() => {
        const saved = localStorage.getItem("preferred-language") as Language;
        if (saved && ["en", "ar", "ru", "zh", "hi"].includes(saved)) {
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("preferred-language", lang);
    };

    const isRTL = language === "ar";

    useEffect(() => {
        document.documentElement.setAttribute("lang", language);
    }, [language]);

    const t = (key: string, section: string = "common") => {
        try {
            return translations[language][section][key] || translations["en"][section][key] || key;
        } catch {
            return key;
        }
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, isRTL, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error("useLanguage must be used within LanguageProvider");
    return context;
}
