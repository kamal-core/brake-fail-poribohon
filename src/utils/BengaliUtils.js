// Bengali Number and Text Formatting Utilities

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/**
 * Converts a standard integer or string of digits to Bengali digits.
 * @param {number|string} num 
 * @returns {string} Bengali digits string
 */
export function toBengaliNumber(num) {
  if (num === null || num === undefined) return '০';
  const str = Math.floor(Math.abs(Number(num))).toString();
  return str.replace(/\d/g, (d) => BENGALI_DIGITS[parseInt(d, 10)]);
}

/**
 * Formats a currency number in Bengali (e.g. 1500 -> ৳১,৫০০)
 * @param {number} amount 
 * @returns {string}
 */
export function formatBengaliCurrency(amount) {
  const rounded = Math.floor(amount || 0);
  const formatted = rounded.toLocaleString('en-US'); // provides commas
  const bengaliFormatted = formatted.replace(/\d/g, (d) => BENGALI_DIGITS[parseInt(d, 10)]);
  return `৳${bengaliFormatted}`;
}

export const FUNNY_DHAKA_SLOGANS = [
  'রাস্তা কি আপনার বাপের?',
  'আপনার সন্তানকে টেসলা দিন: নো লাইসেন্স, নো ব্রেক।',
  '১০০ হাত দূরে থাকুন, ব্রেক ফেইল!',
  'আরে ভাই দেইখা চালান!',
  'উড়ালসড়ক নিচে, আমরা উপরে!',
  'হর্ন দিলে সাইড পাইবেন!',
  'বাপের রাস্তায় জ্যাম কিসের?',
  'ডাইনে সাইড নাই, বামে যান!'
];

export const VIP_ALERTS = [
  'ভিআইপি গাড়ি ২৯১ মি দূরে! সাইড দেন!',
  'পুলিশের সাইরেন শোনা যাচ্ছে! টান মারেন!',
  'বিহঙ্গ বাস আসছে! ১০০ হাত দূরে থাকেন!',
  'রাস্তায় ভিআইপি কনভয়! জরিমানা এড়ান!'
];
