import type { QuizQuestion } from '@/types';

const v = 1;

function q(
  id: string,
  category: QuizQuestion['category'],
  difficulty: QuizQuestion['difficulty'],
  promptEn: string,
  promptBn: string,
  explanationEn: string,
  explanationBn: string,
  options: [string, string, string][],
  answerIds: string[],
): QuizQuestion {
  return {
    id,
    version: v,
    category,
    difficulty,
    localeData: {
      en: { prompt: promptEn, explanation: explanationEn },
      bn: { prompt: promptBn, explanation: explanationBn },
    },
    answerIds,
    options: options.map(([oid, labelEn, labelBn]) => ({ id: `${id}-${oid}`, labelEn, labelBn })),
  };
}

export const quizQuestions: QuizQuestion[] = [
  q('qz-beach', 'landmarks', 'easy', 'Which district is home to Bangladesh’s longest natural sea beach?', 'বাংলাদেশের দীর্ঘতম প্রাকৃতিক সমুদ্রসৈকত কোন জেলায়?', 'Cox’s Bazar has a very long unbroken sandy beach along the Bay of Bengal.', 'কক্সবাজারে বঙ্গোপসাগরের তীরে দীর্ঘ অবিচ্ছিন্ন বালুকাময় সৈকত রয়েছে।',
    [['a', 'Cox’s Bazar', 'কক্সবাজার'], ['b', 'Chattogram', 'চট্টগ্রাম'], ['c', 'Khulna', 'খুলনা']], ['qz-beach-a']),
  q('qz-sundarbans', 'landmarks', 'easy', 'The Sundarbans mangrove forest lies mainly in which division?', 'সুন্দরবন ম্যানগ্রোভ বন মূলত কোন বিভাগে?', 'The Bangladesh part of the Sundarbans is in the Khulna division.', 'সুন্দরবনের বাংলাদেশ অংশ খুলনা বিভাগে।',
    [['a', 'Khulna', 'খুলনা'], ['b', 'Dhaka', 'ঢাকা'], ['c', 'Sylhet', 'সিলেট']], ['qz-sundarbans-a']),
  q('qz-sixtydome', 'landmarks', 'easy', 'The Sixty Dome Mosque is in which district?', 'ষাট গম্বুজ মসজিদ কোন জেলায়?', 'It is part of the historic mosque city of Bagerhat, a UNESCO World Heritage Site.', 'এটি ইউনেস্কো বিশ্ব ঐতিহ্য বাগেরহাটের ঐতিহাসিক মসজিদ নগরীর অংশ।',
    [['a', 'Bagerhat', 'বাগেরহাট'], ['b', 'Dhaka', 'ঢাকা'], ['c', 'Rajshahi', 'রাজশাহী']], ['qz-sixtydome-a']),
  q('qz-paharpur', 'landmarks', 'medium', 'Somapura Mahavihara (Paharpur) is in which district?', 'সোমপুর মহাবিহার (পাহাড়পুর) কোন জেলায়?', 'Paharpur is in Naogaon district and is a UNESCO World Heritage Site.', 'পাহাড়পুর নওগাঁ জেলায় এবং এটি ইউনেস্কো বিশ্ব ঐতিহ্য।',
    [['a', 'Naogaon', 'নওগাঁ'], ['b', 'Bogura', 'বগুড়া'], ['c', 'Pabna', 'পাবনা']], ['qz-paharpur-a']),
  q('qz-tea', 'districts', 'easy', 'Sreemangal, often called the tea capital, is in which district?', 'চা-রাজধানী নামে পরিচিত শ্রীমঙ্গল কোন জেলায়?', 'Sreemangal is in Moulvibazar district in the Sylhet division.', 'শ্রীমঙ্গল সিলেট বিভাগের মৌলভীবাজার জেলায়।',
    [['a', 'Moulvibazar', 'মৌলভীবাজার'], ['b', 'Sylhet', 'সিলেট'], ['c', 'Habiganj', 'হবিগঞ্জ']], ['qz-tea-a']),
  q('qz-kaptai', 'landmarks', 'easy', 'Kaptai Lake is in which district?', 'কাপ্তাই হ্রদ কোন জেলায়?', 'Kaptai Lake was formed by damming the Karnaphuli in Rangamati.', 'কর্ণফুলীতে বাঁধ দিয়ে রাঙ্গামাটিতে কাপ্তাই হ্রদ তৈরি হয়েছে।',
    [['a', 'Rangamati', 'রাঙ্গামাটি'], ['b', 'Bandarban', 'বান্দরবান'], ['c', 'Khagrachhari', 'খাগড়াছড়ি']], ['qz-kaptai-a']),
  q('qz-rasmalai', 'foods', 'easy', 'Rasmalai is especially associated with which district?', 'রসমালাই বিশেষভাবে কোন জেলার সাথে জড়িত?', 'Cumilla is well known across Bangladesh for its rasmalai.', 'কুমিল্লা রসমালাইয়ের জন্য দেশজুড়ে পরিচিত।',
    [['a', 'Cumilla', 'কুমিল্লা'], ['b', 'Feni', 'ফেনী'], ['c', 'Narayanganj', 'নারায়ণগঞ্জ']], ['qz-rasmalai-a']),
  q('qz-bogura-doi', 'foods', 'easy', 'Sweet yogurt (doi) is famously associated with which district?', 'মিষ্টি দই কোন জেলার সাথে বিখ্যাতভাবে জড়িত?', 'Bogura (Bogra) is famous for its sweet yogurt.', 'বগুড়া মিষ্টি দইয়ের জন্য বিখ্যাত।',
    [['a', 'Bogura', 'বগুড়া'], ['b', 'Rangpur', 'রংপুর'], ['c', 'Dinajpur', 'দিনাজপুর']], ['qz-bogura-doi-a']),
  q('qz-mango', 'foods', 'easy', 'Which district is best known for mangoes?', 'আমের জন্য কোন জেলা সবচেয়ে বেশি পরিচিত?', 'Rajshahi and the Chapainawabganj belt are famous for mangoes.', 'রাজশাহী ও চাঁপাইনবাবগঞ্জ অঞ্চল আমের জন্য বিখ্যাত।',
    [['a', 'Rajshahi', 'রাজশাহী'], ['b', 'Khulna', 'খুলনা'], ['c', 'Sylhet', 'সিলেট']], ['qz-mango-a']),
  q('qz-coral', 'landmarks', 'medium', 'Which is Bangladesh’s only coral island?', 'বাংলাদেশের একমাত্র প্রবাল দ্বীপ কোনটি?', 'Saint Martin’s Island, in Cox’s Bazar district, is the only coral island.', 'কক্সবাজার জেলার সেন্ট মার্টিন দ্বীপই একমাত্র প্রবাল দ্বীপ।',
    [['a', 'Saint Martin’s Island', 'সেন্ট মার্টিন দ্বীপ'], ['b', 'Sandwip', 'সন্দ্বীপ'], ['c', 'Moheshkhali', 'মহেশখালী']], ['qz-coral-a']),
  q('qz-north', 'districts', 'medium', 'Which district contains Bangladesh’s northernmost point?', 'বাংলাদেশের সর্ব উত্তরের বিন্দু কোন জেলায়?', 'The northernmost point is in Panchagarh district (Tetulia).', 'সর্ব উত্তরের বিন্দু পঞ্চগড় জেলায় (তেঁতুলিয়া)।',
    [['a', 'Panchagarh', 'পঞ্চগড়'], ['b', 'Thakurgaon', 'ঠাকুরগাঁও'], ['c', 'Nilphamari', 'নীলফামারী']], ['qz-north-a']),
  q('qz-kuakata', 'landmarks', 'easy', 'Kuakata beach is in which district?', 'কুয়াকাটা সৈকত কোন জেলায়?', 'Kuakata is in Patuakhali district and is known for sunrise and sunset views.', 'কুয়াকাটা পটুয়াখালী জেলায়; সূর্যোদয় ও সূর্যাস্তের জন্য পরিচিত।',
    [['a', 'Patuakhali', 'পটুয়াখালী'], ['b', 'Barguna', 'বরগুনা'], ['c', 'Bhola', 'ভোলা']], ['qz-kuakata-a']),
  q('qz-haor', 'landmarks', 'medium', 'Tanguar Haor is in which district?', 'টাঙ্গুয়ার হাওর কোন জেলায়?', 'Tanguar Haor is a Ramsar wetland in Sunamganj.', 'টাঙ্গুয়ার হাওর সুনামগঞ্জের রামসার জলাভূমি।',
    [['a', 'Sunamganj', 'সুনামগঞ্জ'], ['b', 'Sylhet', 'সিলেট'], ['c', 'Kishoreganj', 'কিশোরগঞ্জ']], ['qz-haor-a']),
  q('qz-port', 'districts', 'easy', 'Which district is Bangladesh’s main port city located in?', 'বাংলাদেশের প্রধান বন্দর নগরী কোন জেলায়?', 'Chattogram (Chittagong) is the main port city.', 'চট্টগ্রামই প্রধান বন্দর নগরী।',
    [['a', 'Chattogram', 'চট্টগ্রাম'], ['b', 'Cox’s Bazar', 'কক্সবাজার'], ['c', 'Noakhali', 'নোয়াখালী']], ['qz-port-a']),
  q('qz-cave', 'landmarks', 'medium', 'Alutila cave is in which district?', 'আলুটিলা গুহা কোন জেলায়?', 'Alutila cave is near Khagrachhari town.', 'আলুটিলা গুহা খাগড়াছড়ি শহরের কাছে।',
    [['a', 'Khagrachhari', 'খাগড়াছড়ি'], ['b', 'Rangamati', 'রাঙ্গামাটি'], ['c', 'Bandarban', 'বান্দরবান']], ['qz-cave-a']),
  q('qz-language', 'history', 'medium', 'The Language Movement of 1952 is centred on which city?', '১৯৫২ সালের ভাষা আন্দোলন কোন শহরকে কেন্দ্র করে?', 'The movement took place in Dhaka, then part of East Pakistan.', 'আন্দোলনটি ঢাকায় সংঘটিত হয়, তখনকার পূর্ব পাকিস্তানে।',
    [['a', 'Dhaka', 'ঢাকা'], ['b', 'Chattogram', 'চট্টগ্রাম'], ['c', 'Rajshahi', 'রাজশাহী']], ['qz-language-a']),
  q('qz-hill', 'districts', 'medium', 'Which three districts are the Chittagong Hill Tracts?', 'চট্টগ্রাম পার্বত্য অঞ্চলের তিন জেলা কোনগুলো?', 'Rangamati, Khagrachhari and Bandarban make up the hill tracts.', 'রাঙ্গামাটি, খাগড়াছড়ি ও বান্দরবান পার্বত্য অঞ্চল গঠন করে।',
    [['a', 'Rangamati, Khagrachhari, Bandarban', 'রাঙ্গামাটি, খাগড়াছড়ি, বান্দরবান'], ['b', 'Sylhet, Moulvibazar, Habiganj', 'সিলেট, মৌলভীবাজার, হবিগঞ্জ'], ['c', 'Khulna, Bagerhat, Satkhira', 'খুলনা, বাগেরহাট, সাতক্ষীরা']], ['qz-hill-a']),
  q('qz-jamdani', 'foods', 'hard', 'Jamdani weaving is historically associated with which district?', 'জামদানি বুনন ঐতিহাসিকভাবে কোন জেলার সাথে জড়িত?', 'Narayanganj, especially the Dhaka–Narayanganj area, is a jamdani centre.', 'নারায়ণগঞ্জ, বিশেষত ঢাকা–নারায়ণগঞ্জ এলাকা জামদানির কেন্দ্র।',
    [['a', 'Narayanganj', 'নারায়ণগঞ্জ'], ['b', 'Tangail', 'টাঙ্গাইল'], ['c', 'Kushtia', 'কুষ্টিয়া']], ['qz-jamdani-a']),
  q('qz-lalon', 'history', 'hard', 'The Baul tradition and Lalon are associated with which district?', 'বাউল ঐতিহ্য ও লালন কোন জেলার সাথে জড়িত?', 'Lalon’s shrine is in Kushtia.', 'লালনের মাজার কুষ্টিয়ায়।',
    [['a', 'Kushtia', 'কুষ্টিয়া'], ['b', 'Jashore', 'যশোর'], ['c', 'Pabna', 'পাবনা']], ['qz-lalon-a']),
  q('qz-barishal', 'districts', 'hard', 'Floating guava markets are associated with which division?', 'ভাসমান পেয়ারা বাজার কোন বিভাগের সাথে জড়িত?', 'They are found in the Barishal region, known for its rivers.', 'এগুলো নদীবহুল বরিশাল অঞ্চলে দেখা যায়।',
    [['a', 'Barishal', 'বরিশাল'], ['b', 'Rangpur', 'রংপুর'], ['c', 'Mymensingh', 'ময়মনসিংহ']], ['qz-barishal-a']),
  q('qz-mahasthangarh', 'history', 'hard', 'Mahasthangarh is in which district?', 'মহাস্থানগড় কোন জেলায়?', 'Mahasthangarh is on the Karatoya river in Bogura.', 'মহাস্থানগড় বগুড়ার করতোয়া নদীর তীরে।',
    [['a', 'Bogura', 'বগুড়া'], ['b', 'Rajshahi', 'রাজশাহী'], ['c', 'Pabna', 'পাবনা']], ['qz-mahasthangarh-a']),
  q('qz-khulna-gateway', 'districts', 'medium', 'Which district is commonly the gateway for trips to the Sundarbans?', 'সুন্দরবন ভ্রমণের সাধারণ প্রবেশদ্বার কোন জেলা?', 'Khulna (with Mongla port) is the usual starting point.', 'খুলনা (মোংলা বন্দরসহ) সাধারণ সূচনাবিন্দু।',
    [['a', 'Khulna', 'খুলনা'], ['b', 'Barishal', 'বরিশাল'], ['c', 'Bagerhat', 'বাগেরহাট']], ['qz-khulna-gateway-a']),
  q('qz-ratargul', 'landmarks', 'medium', 'Ratargul swamp forest is in which district?', 'রাতারগুল জলাবন কোন জেলায়?', 'Ratargul is in Sylhet district.', 'রাতারগুল সিলেট জেলায়।',
    [['a', 'Sylhet', 'সিলেট'], ['b', 'Sunamganj', 'সুনামগঞ্জ'], ['c', 'Netrakona', 'নেত্রকোনা']], ['qz-ratargul-a']),
];

export const quizCategories = ['districts', 'landmarks', 'foods', 'rivers', 'history', 'map'] as const;
export const QUIZ_VERSION = v;

export function questionsForCategory(category: string, limit?: number): QuizQuestion[] {
  const filtered = quizQuestions.filter((q2) => q2.category === category);
  return limit ? filtered.slice(0, limit) : filtered;
}

export function dailyChallengeQuestions(date = new Date(), count = 10): QuizQuestion[] {
  const seed = Math.floor(date.getTime() / 86_400_000);
  const shuffled = [...quizQuestions];
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled.slice(0, count);
}

export function quickTen(): QuizQuestion[] {
  return [...quizQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
}
