import type { FamousEntry } from '@/types';

/** Original, factual "famous for" entries. Notes are kept general to avoid stale specifics. */
export const famousEntries: FamousEntry[] = [
  { id: 'f-dhaka-biryani', districtId: 'bd-dhaka', type: 'food', nameEn: 'Kacchi biryani', nameBn: 'কাচ্চি বিরিয়ানি', noteEn: 'Old Dhaka is widely known for its kacchi biryani.', noteBn: 'পুরনো ঢাকা কাচ্চি বিরিয়ানির জন্য পরিচিত।' },
  { id: 'f-dhaka-rickshaw', districtId: 'bd-dhaka', type: 'culture', nameEn: 'Rickshaw art', nameBn: 'রিকশা চিত্রকলা', noteEn: 'Hand-painted rickshaw panels are a recognisable Dhaka folk art.', noteBn: 'হাতে আঁকা রিকশার প্যানেল ঢাকার চেনা লোকশিল্প।' },
  { id: 'f-dhaka-lalbagh', districtId: 'bd-dhaka', type: 'heritage', nameEn: 'Lalbagh Fort', nameBn: 'লালবাগ কেল্লা', placeId: 'p-lalbagh-fort' },
  { id: 'f-cumilla-rasmalai', districtId: 'bd-cumilla', type: 'food', nameEn: 'Rasmalai', nameBn: 'রসমালাই', noteEn: 'Cumilla is well known across Bangladesh for its rasmalai.', noteBn: 'কুমিল্লা রসমালাইয়ের জন্য দেশজুড়ে পরিচিত।' },
  { id: 'f-cumilla-mainamati', districtId: 'bd-cumilla', type: 'heritage', nameEn: 'Mainamati ruins', nameBn: 'ময়নামতির ধ্বংসাবশেষ', placeId: 'p-mainamati' },
  { id: 'f-bogura-doi', districtId: 'bd-bogura', type: 'food', nameEn: 'Bogura doi (yogurt)', nameBn: 'বগুড়ার দই', noteEn: 'Sweet yogurt from Bogura is a famous regional specialty.', noteBn: 'বগুড়ার মিষ্টি দই বিখ্যাত আঞ্চলিক বিশেষত্ব।' },
  { id: 'f-bogura-mahasthangarh', districtId: 'bd-bogura', type: 'heritage', nameEn: 'Mahasthangarh', nameBn: 'মহাস্থানগড়', placeId: 'p-mahasthangarh' },
  { id: 'f-chattogram-mezbani', districtId: 'bd-chattogram', type: 'food', nameEn: 'Mezbani beef', nameBn: 'মেজবানি গরু', noteEn: 'Chattogram is known for its mezbani feast tradition.', noteBn: 'চট্টগ্রাম মেজবানি ভোজের ঐতিহ্যের জন্য পরিচিত।' },
  { id: 'f-coxs-shutki', districtId: 'bd-coxs-bazar', type: 'food', nameEn: 'Dried fish (shutki)', nameBn: 'শুঁটকি', noteEn: 'Coastal Cox’s Bazar is a major centre of dried fish.', noteBn: 'উপকূলীয় কক্সবাজার শুঁটকির বড় কেন্দ্র।' },
  { id: 'f-coxs-beach', districtId: 'bd-coxs-bazar', type: 'nature', nameEn: 'Long sandy beach', nameBn: 'দীর্ঘ বালুকাময় সৈকত', placeId: 'p-coxs-bazar-beach' },
  { id: 'f-sylhet-shatkora', districtId: 'bd-sylhet', type: 'food', nameEn: 'Shatkora', nameBn: 'সাতকরা', noteEn: 'A citrus used in Sylheti cooking.', noteBn: 'সিলেটি রান্নায় ব্যবহৃত এক ধরনের সিট্রাস।' },
  { id: 'f-sylhet-tea', districtId: 'bd-sylhet', type: 'product', nameEn: 'Tea gardens', nameBn: 'চা বাগান', noteEn: 'Sylhet region is a centre of Bangladesh’s tea industry.', noteBn: 'সিলেট অঞ্চল বাংলাদেশের চা শিল্পের কেন্দ্র।' },
  { id: 'f-sylhet-ratargul', districtId: 'bd-sylhet', type: 'nature', nameEn: 'Ratargul swamp forest', nameBn: 'রাতারগুল জলাবন', placeId: 'p-ratargul' },
  { id: 'f-sylhet-shahjalal', districtId: 'bd-sylhet', type: 'culture', nameEn: 'Shah Jalal shrine', nameBn: 'শাহজালাল মাজার', placeId: 'p-shahjalal-mazar' },
  { id: 'f-moulvibazar-tea', districtId: 'bd-moulvibazar', type: 'product', nameEn: 'Sreemangal tea', nameBn: 'শ্রীমঙ্গল চা', noteEn: 'Sreemangal is known as the tea capital of Bangladesh.', noteBn: 'শ্রীমঙ্গল বাংলাদেশের চা-রাজধানী নামে পরিচিত।' },
  { id: 'f-moulvibazar-lawachara', districtId: 'bd-moulvibazar', type: 'nature', nameEn: 'Lawachara forest', nameBn: 'লাউয়াছড়া বন', placeId: 'p-lawachara' },
  { id: 'f-bandarban-nilgiri', districtId: 'bd-bandarban', type: 'nature', nameEn: 'Nilgiri hills', nameBn: 'নীলগিরি পাহাড়', placeId: 'p-nilgiri' },
  { id: 'f-bandarban-culture', districtId: 'bd-bandarban', type: 'culture', nameEn: 'Marma and hill cultures', nameBn: 'মারমা ও পাহাড়ি সংস্কৃতি' },
  { id: 'f-rangamati-lake', districtId: 'bd-rangamati', type: 'nature', nameEn: 'Kaptai Lake', nameBn: 'কাপ্তাই হ্রদ', placeId: 'p-kaptai-lake' },
  { id: 'f-rangamati-textile', districtId: 'bd-rangamati', type: 'product', nameEn: 'Handloom textiles', nameBn: 'তাঁতের কাপড়', noteEn: 'Hill districts produce distinctive handloom fabrics.', noteBn: 'পার্বত্য জেলায় স্বতন্ত্র তাঁতের কাপড় তৈরি হয়।' },
  { id: 'f-khulna-sundarbans', districtId: 'bd-khulna', type: 'nature', nameEn: 'Sundarbans', nameBn: 'সুন্দরবন', placeId: 'p-sundarbans' },
  { id: 'f-khulna-chingri', districtId: 'bd-khulna', type: 'product', nameEn: 'Shrimp and prawns', nameBn: 'চিংড়ি', noteEn: 'Khulna region is a major shrimp-producing area.', noteBn: 'খুলনা অঞ্চল চিংড়ি উৎপাদনের বড় এলাকা।' },
  { id: 'f-bagerhat-mosque', districtId: 'bd-bagerhat', type: 'heritage', nameEn: 'Sixty Dome Mosque', nameBn: 'ষাট গম্বুজ মসজিদ', placeId: 'p-sixty-dome-mosque' },
  { id: 'f-naogaon-paharpur', districtId: 'bd-naogaon', type: 'heritage', nameEn: 'Paharpur (Somapura)', nameBn: 'পাহাড়পুর (সোমপুর)', placeId: 'p-somapura-mahavihara' },
  { id: 'f-rajshahi-mango', districtId: 'bd-rajshahi', type: 'product', nameEn: 'Mango', nameBn: 'আম', noteEn: 'The Rajshahi–Chapainawabganj belt is famous for mangoes.', noteBn: 'রাজশাহী–চাঁপাইনবাবগঞ্জ অঞ্চল আমের জন্য বিখ্যাত।' },
  { id: 'f-rajshahi-silk', districtId: 'bd-rajshahi', type: 'product', nameEn: 'Silk', nameBn: 'সিল্ক', noteEn: 'Rajshahi has a long association with silk production.', noteBn: 'রাজশাহীর সিল্ক উৎপাদনের দীর্ঘ ঐতিহ্য আছে।' },
  { id: 'f-rajshahi-puthia', districtId: 'bd-rajshahi', type: 'heritage', nameEn: 'Puthia temples', nameBn: 'পুঠিয়া মন্দির', placeId: 'p-puthia' },
  { id: 'f-chapainababganj-mango', districtId: 'bd-chapainababganj', type: 'product', nameEn: 'Khirshapat mangoes', nameBn: 'খিরসাপাত আম', noteEn: 'Chapainawabganj is a key mango-growing district.', noteBn: 'চাঁপাইনবাবগঞ্জ আম উৎপাদনের প্রধান জেলা।' },
  { id: 'f-natore-kachagolla', districtId: 'bd-natore', type: 'food', nameEn: 'Kacha golla', nameBn: 'কাঁচাগোল্লা', noteEn: 'Natore is known for its kacha golla sweet.', noteBn: 'নাটোর কাঁচাগোল্লার জন্য পরিচিত।' },
  { id: 'f-faridpur-kachagolla', districtId: 'bd-faridpur', type: 'food', nameEn: 'Kacha golla', nameBn: 'কাঁচাগোল্লা', noteEn: 'Faridpur is also known for this milk sweet.', noteBn: 'ফরিদপুরও এই দুধের মিষ্টির জন্য পরিচিত।' },
  { id: 'f-narayanganj-jamdani', districtId: 'bd-narayanganj', type: 'product', nameEn: 'Jamdani weaving', nameBn: 'জামদানি বুনন', noteEn: 'Narayanganj is a historic centre of jamdani weaving.', noteBn: 'নারায়ণগঞ্জ জামদানি বুননের ঐতিহাসিক কেন্দ্র।' },
  { id: 'f-tangail-saree', districtId: 'bd-tangail', type: 'product', nameEn: 'Tangail saree', nameBn: 'টাঙ্গাইল শাড়ি', noteEn: 'Tangail is known for its handloom sarees.', noteBn: 'টাঙ্গাইল তাঁতের শাড়ির জন্য পরিচিত।' },
  { id: 'f-kushtia-lalon', districtId: 'bd-kushtia', type: 'culture', nameEn: 'Lalon and Baul culture', nameBn: 'লালন ও বাউল সংস্কৃতি', noteEn: 'Kushtia is associated with the Baul tradition and Lalon.', noteBn: 'কুষ্টিয়া বাউল ঐতিহ্য ও লালনের সাথে জড়িত।' },
  { id: 'f-dinajpur-kantanagar', districtId: 'bd-dinajpur', type: 'heritage', nameEn: 'Kantanagar Temple', nameBn: 'কান্তনগর মন্দির', placeId: 'p-kantanagar' },
  { id: 'f-dinajpur-rangpur', districtId: 'bd-dinajpur', type: 'product', nameEn: 'Rice (Dinajpur)', nameBn: 'চাল (দিনাজপুর)', noteEn: 'Dinajpur is a major rice-growing district.', noteBn: 'দিনাজপুর চাল উৎপাদনের বড় জেলা।' },
  { id: 'f-sunamganj-haor', districtId: 'bd-sunamganj', type: 'nature', nameEn: 'Tanguar Haor', nameBn: 'টাঙ্গুয়ার হাওর', placeId: 'p-tanguar-haor' },
  { id: 'f-patuakhali-kuakata', districtId: 'bd-patuakhali', type: 'nature', nameEn: 'Kuakata beach', nameBn: 'কুয়াকাটা সৈকত', placeId: 'p-kuakata' },
  { id: 'f-khagrachhari-alutila', districtId: 'bd-khagrachhari', type: 'nature', nameEn: 'Alutila cave', nameBn: 'আলুটিলা গুহা', placeId: 'p-alutila-cave' },
  { id: 'f-barishal-floating', districtId: 'bd-barishal', type: 'culture', nameEn: 'Floating guava markets', nameBn: 'ভাসমান পেয়ারা বাজার', noteEn: 'Barishal region is known for its floating markets and rivers.', noteBn: 'বরিশাল অঞ্চল ভাসমান বাজার ও নদীর জন্য পরিচিত।' },
  { id: 'f-jhalokati-coconut', districtId: 'bd-jhalokati', type: 'product', nameEn: 'Coconut and guava', nameBn: 'নারকেল ও পেয়ারা' },
  { id: 'f-gazipur-bhawal', districtId: 'bd-gazipur', type: 'nature', nameEn: 'Bhawal forest', nameBn: 'ভাওয়াল বন', placeId: 'p-bhawal' },
];

export const famousTypes = ['food', 'product', 'nature', 'heritage', 'culture'] as const;

export function famousForDistrict(districtId: string): FamousEntry[] {
  return famousEntries.filter((f) => f.districtId === districtId);
}
