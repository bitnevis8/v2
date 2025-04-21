"use client"

import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div className="relative h-screen">
        <Image
          src="/images/background.webp"
          alt="Arya Foulad Gharn Background"
          fill
          className="object-cover brightness-75"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              شرکت بازرسی آریا فولاد قرن.
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              ارائه خدمات بازرسی، کنترل کیفیت و صدور گواهینامه‌های استاندارد
            </p>
            <Link 
              href="/dashboard"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors duration-300"
            >
              ورود به داشبورد
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-10 sm:py-20 bg-white">
        <div className="px-0 sm:px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            خدمات ما
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-emerald-600 text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-3">بازرسی فنی</h3>
              <p className="text-gray-600">
                بازرسی تخصصی تجهیزات و تأسیسات صنعتی با استفاده از متدهای پیشرفته
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-emerald-600 text-4xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-3">کنترل کیفیت</h3>
              <p className="text-gray-600">
                نظارت و کنترل کیفیت محصولات و فرآیندهای تولیدی
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-emerald-600 text-4xl mb-4">📜</div>
              <h3 className="text-xl font-semibold mb-3">گواهینامه‌ها</h3>
              <p className="text-gray-600">
                صدور گواهینامه‌های استاندارد و تأییدیه‌های کیفیت
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="py-10 sm:py-20 bg-gray-50">
        <div className="px-0 sm:px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              درباره آریا فولاد قرن
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              شرکت بازرسی آریا فولاد قرن با بیش از یک دهه تجربه در زمینه بازرسی و کنترل کیفیت، 
              یکی از معتبرترین شرکت‌های بازرسی در صنعت فولاد و معدن است. ما با بهره‌گیری از 
              نیروهای متخصص و تجهیزات پیشرفته، خدمات جامع بازرسی و کنترل کیفیت را به مشتریان 
              خود ارائه می‌دهیم.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center md:text-right">
              <h3 className="text-xl font-semibold mb-4">آدرس</h3>
              <p className="text-gray-300">
                اهواز، زیتون کارمندی، خیابان جهانگیری، بین زیبا و انوشه، پلاک ۳۳
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">تماس</h3>
              <p className="text-gray-300">
                ۰۶۱-۳۴۴۳۷۴۳۹
              </p>
              <p className="text-gray-300 mt-2">
                ایمیل: info@afg-insp.ir
              </p>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-semibold mb-4">ساعات کاری</h3>
              <p className="text-gray-300">
                شنبه تا چهارشنبه: ۸ تا ۱۶
              </p>
              <p className="text-gray-300">
                پنجشنبه: ۸ تا ۱۲
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300">تمامی حقوق محفوظ است © 1404 شرکت بازرسی آریا فولاد قرن</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
