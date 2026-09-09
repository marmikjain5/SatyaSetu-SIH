/**
 * Deterministic Multilingual Complaint Classifier for SatyaDrishti
 *
 * Implements pure deterministic text normalization, tokenization, phrase dictionary matching,
 * regex patterns, and confidence scoring across 13 legal metrology & consumer protection categories
 * for English, Hindi (हिन्दी), Kannada (ಕನ್ನಡ), Tamil (தமிழ்), and mixed-language inputs.
 *
 * NO LLM IS USED IN THIS CLASSIFICATION PIPELINE.
 */

import type { ComplaintCategoryCode, ComplaintClassificationResult } from '../types/compliance';

export interface CategoryPatternDefinition {
  code: ComplaintCategoryCode;
  label: string;
  keywords: string[];
  phrases: string[];
  regexes: RegExp[];
}

export const CATEGORY_PATTERNS: CategoryPatternDefinition[] = [
  {
    code: 'price_above_mrp',
    label: 'Altered / Dual MRP Sticker on Packaging',
    keywords: [
      // English
      'charged', 'overcharged', 'bill', 'receipt', 'extra', 'more', 'overcharge', 'selling price',
      // Hindi & Hinglish
      'ज्यादा', 'अधिक', 'लिया', 'पैसे', 'मूल्य', 'दाम', 'एमआरपी', 'zyada', 'jyada', 'extra', 'badha',
      // Kannada & Kanglish
      'ಹೆಚ್ಚು', 'ಬೆಲೆ', 'ಹಣ', 'ಬಿಲ್ಲು', 'ಜಾಸ್ತಿ', 'hechu', 'jaasthi', 'duddu',
      // Tamil & Tanglish
      'அதிக', 'விலை', 'பணம்', 'கூடுதல்', 'adhiga', 'jasthee', 'panam',
    ],
    phrases: [
      // English
      'price above mrp',
      'charged more than mrp',
      'charged higher than mrp',
      'charged over mrp',
      'paid more than printed',
      'above printed price',
      'charged extra',
      'retailer charged more',
      'shop charged me',
      'receipt shows higher',
      'billed above mrp',
      'charged extra money',
      'packet says',
      'printed price is',
      // Hindi
      'mrp से ज्यादा',
      'एमआरपी से अधिक',
      'ज्यादा दाम लिया',
      'ज्यादा पैसे लिए',
      'बिल में ज्यादा',
      'एमआरपी से ज्यादा कीमत',
      'mrp se zyada',
      'extra paise',
      'bill me zyada',
      // Kannada
      'mrp ಗಿಂತ ಹೆಚ್ಚು',
      'ಎಮ್‌ಆರ್‌ಪಿ ಗಿಂತ ಹೆಚ್ಚು',
      'ಹೆಚ್ಚು ಹಣ',
      'ಬಿಲ್ಲು ಹೆಚ್ಚು',
      'ಹೆಚ್ಚಿನ ಹಣ ಸಂಗ್ರಹ',
      'mrp ginta hechu',
      'duddu jaasthi',
      // Tamil
      'mrp ஐ விட அதிக',
      'அதிக விலை',
      'கூடுதல் பணம்',
      'பில்லில் கூடுதல்',
      'எம்.ஆர்.பி ஐ விட அதிக',
      'mrp vida adhiga',
      'extra panam',
    ],
    regexes: [
      /charged\s+(?:me\s+)?(?:rs\.?|₹)?\s*\d+.*?(?:mrp|printed|packet)\s*(?:is|says|shows)?\s*(?:rs\.?|₹)?\s*\d+/i,
      /packet\s*(?:says|shows)?\s*(?:rs\.?|₹)?\s*\d+.*?(?:charged|billed|paid)\s*(?:me\s+)?(?:rs\.?|₹)?\s*\d+/i,
      /mrp\s*(?:is|was)?\s*(?:rs\.?|₹)?\s*\d+.*?(?:charged|paid|bill)\s*(?:rs\.?|₹)?\s*\d+/i,
      /overcharg(?:ed|ing)\s*(?:above|over)\s*mrp/i,
      /(?:mrp|एमआरपी|ಎಮ್‌ಆರ್‌ಪಿ|எம்\.ஆர்\.பி)\s*(?:से|ಗಿಂತ|விட|se|ginta|vida)\s*(?:ज्यादा|अधिक|ಹೆಚ್ಚು|ಜಾಸ್ತಿ|அதிக|zyada|hechu|adhiga)/i,
      /(?:ज्यादा|अधिक|ಹೆಚ್ಚು|ಜಾಸ್ತಿ|அதிக|zyada|jaasthi)\s*(?:पैसे|दाम|ಹಣ|ಬೆಲೆ|விலை|பணம்|paise|duddu)\s*(?:लिया|ಪಡೆದಿದ್ದಾರೆ|வசூலிக்கப்பட்டது|liya)/i,
    ],
  },
  {
    code: 'mrp_discrepancy',
    label: 'MRP Discrepancy / Dual Pricing / Sticker Alteration',
    keywords: [
      'sticker', 'dual', 'altered', 'overprinted', 'pasted', 'tampered', 'discrepancy', 'covered',
      'स्टिकर', 'दोहरी', 'ಸ್ಟಿಕ್ಕರ್', 'ಎರಡು', 'ஸ்டிக்கர்', 'இரட்டை',
    ],
    phrases: [
      // English
      'mrp discrepancy',
      'dual mrp',
      'sticker over mrp',
      'sticker on price',
      'pasted sticker',
      'two mrps',
      'different prices',
      'mrp altered',
      'price covered by sticker',
      'printed price hidden',
      'double price tag',
      // Hindi
      'mrp पर स्टिकर',
      'दोहरी mrp',
      'दाम पर स्टीकर',
      'एमआरपी बदला',
      'do mrp',
      'sticker over mrp',
      // Kannada
      'mrp ಮೇಲೆ ಸ್ಟಿಕ್ಕರ್',
      'ಎರಡು ಎಂಆರ್‌ಪಿ',
      'ಬೆಲೆ ತಿದ್ದುಪಡಿ',
      'mrp mele sticker',
      'eradu mrp',
      // Tamil
      'mrp மீது ஸ்டிக்கர்',
      'இரட்டை mrp',
      'விலை மாற்றப்பட்டுள்ளது',
      'mrp mela sticker',
    ],
    regexes: [
      /sticker\s+(?:on|over|pasted|covering)\s+(?:mrp|price|printed)/i,
      /dual\s+mrp/i,
      /two\s+different\s+mrp/i,
      /mrp\s+discrepancy/i,
      /(?:स्टिकर|ಸ್ಟಿಕ್ಕರ್|ஸ்டிக்கர்)\s+(?:चिपकाया|ಹಾಕಿದ್ದಾರೆ|ஒட்டப்பட்டுள்ளது|pasted)/i,
      /(?:दोहरी|ಎರಡು|இரட்டை)\s*(?:mrp|एमआरपी|ಎಮ್‌ಆರ್‌ಪಿ|எம்\.ஆர்\.பி)/i,
    ],
  },
  {
    code: 'missing_mrp',
    label: 'Missing Maximum Retail Price (MRP) Declaration',
    keywords: [
      // English
      'missing', 'absent', 'no price', 'unprinted', 'omitted', 'hidden', 'n/a', 'show',
      // Hindi
      'नहीं', 'गायब', 'अंकित', 'nahi', 'nahin', 'गया',
      // Kannada
      'ಇಲ್ಲ', 'ನಮೂದಿಸಿಲ್ಲ', 'ಮುದ್ರಿಸಿಲ್ಲ', 'illa', 'namodisilla',
      // Tamil
      'இல்லை', 'குறிப்பிடப்படவில்லை', 'அச்சிடப்படவில்லை', 'illai', 'kuripidavillai',
    ],
    phrases: [
      // English
      'missing mrp',
      'mrp is missing',
      'no mrp',
      'mrp isn\'t written',
      'mrp not written',
      'no price on packet',
      'price is not printed',
      'maximum retail price is missing',
      'no maximum retail price',
      'price not declared',
      'without mrp',
      'mrp not mentioned',
      'does not show the mrp',
      'packet does not show',
      // Hindi
      'mrp नहीं लिखा',
      'mrp नहीं है',
      'एमआरपी नहीं लिखा',
      'एमआरपी गायब',
      'मूल्य अंकित नहीं',
      'कोई mrp नहीं',
      'mrp nahi hai',
      'mrp nahi likha',
      'is packet par mrp nahi',
      // Kannada
      'mrp ನಮೂದಿಸಿಲ್ಲ',
      'mrp ಇಲ್ಲ',
      'ಬೆಲೆ ಮುದ್ರಿಸಿಲ್ಲ',
      'ಎಂಆರ್‌ಪಿ ಇಲ್ಲ',
      'ಮ್ಯಾಕ್ಸಿಮಮ್ ರಿಟೇಲ್ ಪ್ರೈಸ್ ಇಲ್ಲ',
      'mrp illa',
      'mrp namodisilla',
      'ee packet alli mrp',
      // Tamil
      'mrp குறிப்பிடப்படவில்லை',
      'mrp இல்லை',
      'விலை அச்சிடப்படவில்லை',
      'எம்.ஆர்.பி இல்லை',
      'mrp illai',
      'mrp kuripidavillai',
      'indha packet il mrp',
    ],
    regexes: [
      /(?:no|missing|without|does\s+not\s+show)\s+(?:the\s+)?(?:mrp|maximum\s+retail\s+price|price\s+tag)/i,
      /(?:mrp|price|एमआरपी|ಎಮ್‌ಆರ್‌ಪಿ|ಎಂಆರ್‌ಪಿ|எம்\.ஆர்\.பி)\s+(?:is\s+)?not\s+(?:printed|written|declared|mentioned|found|shown)/i,
      /(?:mrp|एमआरपी|ಎಮ್‌ಆರ್‌ಪಿ|ಎಂಆರ್‌ಪಿ|எம்\.ஆர்\.பி)\s*.*?(?:नहीं|इल्ला|ಇಲ್ಲ|இல்லை|ನಮೂದಿಸಿಲ್ಲ|குறிப்பிடப்படவில்லை|nahi|illa|illai|namodisilla|kuripidavillai)/i,
      /(?:नहीं|इल्ला|ಇಲ್ಲ|இல்லை|ನಮೂದಿಸಿಲ್ಲ|குறிப்பிடப்படவில்லை|nahi|illa|illai|namodisilla|kuripidavillai)\s*.*?(?:लिखा|नಮೂದಿಸಿಲ್ಲ|குறிப்பிடப்படவில்லை|likha|namodisilla|kuripidavillai)/i,
      /(?:packet|पैकेट|ಪ್ಯಾಕೆಟ್|பாக்கெட்)\s*.*?(?:mrp|price)\s*.*?(?:नहीं|ಇಲ್ಲ|இல்லை|ನಮೂದಿಸಿಲ್ಲ|குறிப்பிடப்படவில்லை|nahi|illa|illai|namodisilla|kuripidavillai)/i,
    ],
  },
  {
    code: 'quantity_discrepancy',
    label: 'Net Quantity / Short Weight Discrepancy',
    keywords: [
      'underweight', 'shortage', 'less', 'short', 'weighs', 'empty', 'half', 'deficit',
      'कम', 'वजन', 'ಕಡಿಮೆ', 'ತೂಕ', 'குறைவான', 'எடை', 'kam', 'tooka', 'edai',
    ],
    phrases: [
      // English
      'quantity discrepancy',
      'short weight',
      'underweight product',
      'less weight',
      'weighs less than printed',
      'weighs less than declared',
      'packet says 1kg but',
      'actual weight is less',
      'short volume',
      'quantity short',
      'deflated quantity',
      // Hindi
      'वजन कम है',
      'कम सामान है',
      'लिखे हुए से कम वजन',
      'कम मात्रा',
      'vajan kam hai',
      'weight kam hai',
      // Kannada
      'ತೂಕ ಕಡಿಮೆಯಾಗಿದೆ',
      'ಪ್ರಮಾಣ ಕಡಿಮೆ ಇದೆ',
      'ತೂಕದಲ್ಲಿ ವ್ಯತ್ಯಾಸ',
      'tooka kadime',
      'pramana kadime',
      // Tamil
      'எடை குறைவாக உள்ளது',
      'அளவு குறைவாக உள்ளது',
      'எடையில் வித்தியாசம்',
      'edai kuraivaga',
      'alavu kammi',
    ],
    regexes: [
      /(?:weighs?|weight)\s+less\s+than/i,
      /short\s+(?:weight|quantity|volume)/i,
      /underweight/i,
      /says?\s+\d+\s*(?:g|kg|ml|l).*?actual(?:ly)?\s+(?:is\s+)?\d+/i,
      /(?:वजन|ತೂಕ|எடை|vajan|tooka|edai)\s*(?:कम|ಕಡಿಮೆ|குறைவாக|kam|kadime|kammi)/i,
    ],
  },
  {
    code: 'missing_net_quantity',
    label: 'Missing Net Quantity / Weight Declaration',
    keywords: [
      'net qty', 'net weight', 'volume', 'missing quantity', 'qty missing',
      'नेट वजन', 'ನಿವ್ವಳ ತೂಕ', 'நிகர எடை', 'net weight',
    ],
    phrases: [
      // English
      'missing net quantity',
      'net quantity missing',
      'no net weight',
      'net weight missing',
      'weight not declared',
      'quantity not mentioned',
      'volume not written',
      'no net qty',
      'without quantity declaration',
      // Hindi
      'नेट वजन नहीं लिखा',
      'मात्रा नहीं लिखी',
      'वजन गायब',
      'net quantity missing',
      // Kannada
      'ನಿವ್ವಳ ತೂಕ ನಮೂದಿಸಿಲ್ಲ',
      'ಪ್ರಮಾಣ ಮುದ್ರಿಸಿಲ್ಲ',
      'ತೂಕದ ಮಾಹಿತಿ ಇಲ್ಲ',
      'net weight illa',
      // Tamil
      'நிகர எடை குறிப்பிடப்படவில்லை',
      'அளவு அச்சிடப்படவில்லை',
      'எடை விவரம் இல்லை',
      'net weight illai',
    ],
    regexes: [
      /(?:no|missing|without)\s+net\s+(?:qty|quantity|weight|vol|volume)/i,
      /net\s+(?:qty|quantity|weight)\s+(?:is\s+)?not\s+(?:printed|declared|mentioned)/i,
      /(?:नेट\s*वजन|ನಿವ್ವಳ\s*ತೂಕ|நிகர\s*எடை)\s*(?:नहीं|ಇಲ್ಲ|இல்லை|nahi|illa|illai)/i,
    ],
  },
  {
    code: 'missing_manufacturer',
    label: 'Missing Manufacturer / Packer Name & Address',
    keywords: [
      'manufacturer', 'packer', 'maker', 'producer', 'address', 'premise',
      'निर्माता', 'तयारकर', 'உற்பத்தியாளர்', 'தயாரிப்பாளர்',
    ],
    phrases: [
      // English
      'missing manufacturer',
      'manufacturer information missing',
      'no manufacturer name',
      'manufacturer details missing',
      'mfg address missing',
      'packer details missing',
      'no maker name',
      'who manufactured this not written',
      'no manufacturer address',
      // Hindi
      'निर्माता का नाम नहीं',
      'बनाने वाले का पता नहीं',
      'पैकर की जानकारी नहीं',
      'manufacturer details nahi',
      // Kannada
      'ತಯಾರಕರ ಹೆಸರು ಇಲ್ಲ',
      'ಉತ್ಪಾದಕರ ಮಾಹಿತಿ ಇಲ್ಲ',
      'ವಿಳಾಸ ಇಲ್ಲ',
      'manufacturer vilasa illa',
      // Tamil
      'தயாரிப்பாளர் பெயர் இல்லை',
      'உற்பத்தியாளர் விவரம் இல்லை',
      'முகவரி இல்லை',
      'manufacturer mukavari illai',
    ],
    regexes: [
      /(?:no|missing|without)\s+manufacturer/i,
      /manufacturer\s+(?:name|address|details)?\s+(?:is\s+)?missing/i,
      /packer\s+(?:name|address)?\s+(?:is\s+)?missing/i,
      /(?:निर्माता|बनाने\s*वाले|ತಯಾರಕರ|ಉತ್ಪಾದಕರ|உற்பத்தியாளர்|தயாரிப்பாளர்)\s*.*?(?:नहीं|इल्ला|ಇಲ್ಲ|இல்லை|nahi|illa|illai)/i,
    ],
  },
  {
    code: 'missing_importer',
    label: 'Missing Importer Information (Imported Goods)',
    keywords: [
      'importer', 'imported', 'import', 'foreign', 'origin',
      'आयातकर्ता', 'ಆಮದುದಾರ', 'இறக்குமதியாளர்',
    ],
    phrases: [
      // English
      'missing importer',
      'importer information missing',
      'no importer name',
      'imported item without importer',
      'importer address missing',
      'no import details',
      // Hindi
      'आयातकर्ता की जानकारी नहीं',
      'इम्पोर्टर का नाम नहीं',
      'importer missing',
      // Kannada
      'ಆಮದುದಾರರ ಮಾಹಿತಿ ಇಲ್ಲ',
      'ಇಂಪೋರ್ಟರ್ ಹೆಸರು ಇಲ್ಲ',
      'importer details illa',
      // Tamil
      'இறக்குமதியாளர் விவரங்கள் இல்லை',
      'இம்போர்ட்டர் பெயர் இல்லை',
      'importer details illai',
    ],
    regexes: [
      /(?:no|missing|without)\s+importer/i,
      /importer\s+(?:name|address|details)?\s+(?:is\s+)?missing/i,
      /(?:आयातकर्ता|ಆಮದುದಾರ|இறக்குமதியாளர்)\s*(?:नहीं|ಇಲ್ಲ|இல்லை|nahi|illa|illai)/i,
    ],
  },
  {
    code: 'missing_customer_care',
    label: 'Missing Consumer Care Helpline / Contact Details',
    keywords: [
      'helpline', 'customer care', 'consumer care', 'tollfree', 'contact', 'email',
      'कस्टमर केयर', 'ಗ್ರಾಹಕ ಸೇವೆ', 'வாடிக்கையாளர் சேவை',
    ],
    phrases: [
      // English
      'missing customer care',
      'customer care missing',
      'no customer care number',
      'no helpline',
      'helpline missing',
      'no contact number for complaint',
      'consumer care details missing',
      'no customer email',
      // Hindi
      'कस्टमर केयर नंबर नहीं',
      'हेल्पलाइन नंबर नहीं',
      'customer care number nahi',
      // Kannada
      'ಗ್ರಾಹಕ ಸೇವಾ ಸಂಖ್ಯೆ ಇಲ್ಲ',
      'ಹೆಲ್ಪ್‌ಲೈನ್ ಸಂಖ್ಯೆ ಇಲ್ಲ',
      'customer care number illa',
      // Tamil
      'வாடிக்கையாளர் சேவை எண் இல்லை',
      'ஹெல்ப்லைன் இல்லை',
      'customer care number illai',
    ],
    regexes: [
      /(?:no|missing|without)\s+customer\s+care/i,
      /customer\s+care\s+(?:number|details|email)?\s+(?:is\s+)?missing/i,
      /helpline\s+(?:number)?\s+missing/i,
      /(?:कस्टमर\s*केयर|ಗ್ರಾಹಕ\s*ಸೇವೆ|வாடிக்கையாளர்\s*சேவை)\s*(?:नहीं|ಇಲ್ಲ|இல்லை|nahi|illa|illai)/i,
    ],
  },
  {
    code: 'unreadable_declaration',
    label: 'Unreadable / Tiny / Smudged Statutory Declaration',
    keywords: [
      'unreadable', 'blurred', 'tiny', 'smudged', 'faded', 'illegible', 'font', 'small',
      'अस्पष्ट', 'छोटा', 'ಮಸುಕಾದ', 'ಚಿಕ್ಕ', 'மங்கலான', 'சிறிய',
    ],
    phrases: [
      // English
      'unreadable declaration',
      'text is too small',
      'tiny font',
      'blurred print',
      'smudged text',
      'faded print',
      'cannot read text',
      'illegible label',
      'font size too small',
      'unreadable print',
      // Hindi
      'अक्षर बहुत छोटे हैं',
      'पढ़ी नहीं जा रही',
      'धुंधला छापा',
      'padha nahi ja raha',
      // Kannada
      'ಅಕ್ಷರಗಳು ತುಂಬಾ ಚಿಕ್ಕವು',
      'ಓದಲು ಸಾಧ್ಯವಿಲ್ಲ',
      'ಮಸುಕಾದ ಅಕ್ಷರಗಳು',
      'odalu sadhya illa',
      // Tamil
      'எழுத்துக்கள் மிகச் சிறியவை',
      'படிக்க முடியவில்லை',
      'மங்கலான எழுத்துக்கள்',
      'padikka mudiyavillai',
    ],
    regexes: [
      /unreadable/i,
      /(?:too\s+small|tiny)\s+(?:font|print|text)/i,
      /(?:smudged|blurred|faded|illegible)\s+(?:print|text|label|declaration)/i,
      /(?:अस्पष्ट|ಮಸುಕಾದ|மங்கலான)\s*(?:छापा|ಅಕ್ಷರ|எழுத்து)/i,
    ],
  },
  {
    code: 'misleading_claim',
    label: 'Misleading Claim / Deceptive / False Advertising',
    keywords: [
      'misleading', 'false', 'deceptive', 'fake', 'bogus', 'unsubstantiated', 'fraudulent',
      'गुमराह', 'झूठा', 'ದಾರಿ ತಪ್ಪಿಸುವ', 'ಸುಳ್ಳು', 'தவறான', 'பொய்',
    ],
    phrases: [
      // English
      'misleading claim',
      'false advertisement',
      'fake health claim',
      'misleading packaging',
      'false promise',
      'deceptive description',
      'fake organic',
      'misleading label',
      'false claim',
      // Hindi
      'गुमराह करने वाला दावा',
      'झूठा विज्ञापन',
      'गलत दावा',
      'fake advertisement',
      // Kannada
      'ದಾರಿ ತಪ್ಪಿಸುವ ಹೇಳಿಕೆ',
      'ಸುಳ್ಳು ಜಾಹೀರಾತು',
      'sullu jaahiratu',
      // Tamil
      'தவறான விளம்பரம்',
      'பொய்யான உரிமை கோரல்',
      'poyyana vilambaram',
    ],
    regexes: [
      /misleading\s+(?:claim|ad|advertisement|label|packaging)/i,
      /false\s+(?:claim|advertisement|promise|ad)/i,
      /deceptive/i,
      /(?:गुमराह|ದಾರಿ\s*ತಪ್ಪಿಸುವ|தவறான)\s*(?:दावा|ಹೇಳಿಕೆ|விளம்பரம்)/i,
    ],
  },
  {
    code: 'product_identity_concern',
    label: 'Product Identity Concern / Missing Generic Name',
    keywords: [
      'identity', 'generic name', 'common name', 'what is product', 'unknown',
      'सामान्य नाम', 'ಸಾಮಾನ್ಯ ಹೆಸರು', 'பொதுவான பெயர்',
    ],
    phrases: [
      // English
      'product identity concern',
      'generic name missing',
      'no generic name',
      'common name missing',
      'vague product name',
      'no common product name',
      'what is inside not stated',
      // Hindi
      'सामान्य नाम नहीं लिखा',
      'उत्पाद की पहचान अस्पष्ट',
      'generic name nahi',
      // Kannada
      'ಸಾಮಾನ್ಯ ಹೆಸರು ನಮೂದಿಸಿಲ್ಲ',
      'ಉತ್ಪನ್ನದ ಹೆಸರು ಇಲ್ಲ',
      'generic name illa',
      // Tamil
      'பொதுவான பெயர் குறிப்பிடப்படவில்லை',
      'பொருளின் அடையாளம் இல்லை',
      'generic name illai',
    ],
    regexes: [
      /(?:no|missing)\s+generic\s+name/i,
      /generic\s+name\s+(?:is\s+)?missing/i,
      /product\s+identity/i,
      /(?:सामान्य\s*नाम|ಸಾಮಾನ್ಯ\s*ಹೆಸರು|பொதுவான\s*பெயர்)\s*(?:नहीं|ಇಲ್ಲ|இல்லை|nahi|illa|illai)/i,
    ],
  },
  {
    code: 'general_packaging_issue',
    label: 'General Statutory Packaging Compliance Violation',
    keywords: [
      'non-compliant', 'violation', 'statutory', 'symbol', 'fssai', 'bis', 'packaging', 'rules',
      'उल्लंघन', 'ಉಲ್ಲಂಘನೆ', 'மீறுதல்',
    ],
    phrases: [
      // English
      'general packaging issue',
      'packaging non compliant',
      'missing statutory notice',
      'veg symbol missing',
      'fssai license missing',
      'bis mark missing',
      'packaging rules violated',
      'statutory violation',
      // Hindi
      'पैकेजिंग के नियमों का उल्लंघन',
      'वेज सिंबल नहीं है',
      'fssai लाइसेंस नहीं है',
      // Kannada
      'ಪ್ಯಾಕೇಜಿಂಗ್ ನಿಯಮಗಳ ಉಲ್ಲಂಘನೆ',
      'ವೆಜ್ ಚಿಹ್ನೆ ಇಲ್ಲ',
      'fssai ಲೈಸೆನ್ಸ್ ಇಲ್ಲ',
      // Tamil
      'பேக்கேஜிங் விதிகளை மீறுதல்',
      'வெஜ் குறியீடு இல்லை',
      'fssai உரிமம் இல்லை',
    ],
    regexes: [
      /packaging\s+(?:non-compliant|violation|issue)/i,
      /missing\s+(?:fssai|bis|veg\s+symbol|license)/i,
      /statutory\s+declaration\s+missing/i,
      /(?:नियमों\s*का\s*उल्लंघन|ನಿಯಮಗಳ\s*ಉಲ್ಲಂಘನೆ|விதிகளை\s*மீறுதல்)/i,
    ],
  },
];

/**
 * Normalizes input text for deterministic matching across Unicode scripts and Indic numerals.
 */
export function normalizeComplaintText(text: string): string {
  if (!text) return '';

  let str = text;

  // 1. Convert Indic numerals (Devanagari, Kannada, Tamil) to ASCII digits 0-9
  // Devanagari ०-९ (U+0966 to U+096F)
  str = str.replace(/[\u0966-\u096F]/g, (ch) => String(ch.charCodeAt(0) - 0x0966));
  // Kannada ೦-೯ (U+0CE6 to U+0CEF)
  str = str.replace(/[\u0CE6-\u0CEF]/g, (ch) => String(ch.charCodeAt(0) - 0x0CE6));
  // Tamil ௦-௯ (U+0BE6 to U+0BEF)
  str = str.replace(/[\u0BE6-\u0BEF]/g, (ch) => String(ch.charCodeAt(0) - 0x0BE6));

  // 2. Unicode normalization to lower case, preserving Unicode letters & numbers & currency symbols
  return str
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s₹.]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deterministically classifies a consumer complaint text in English, Hindi, Kannada, Tamil, or mixed language.
 */
export function classifyComplaintText(
  rawText: string,
  extraContext?: {
    packagingMrp?: string | number;
    receiptPrice?: string | number;
    declaredWeight?: string;
    actualWeight?: string;
  }
): ComplaintClassificationResult {
  const normalized = normalizeComplaintText(rawText);
  if (!normalized) {
    return {
      categoryCode: 'other_unclear',
      categoryLabel: 'Other / Unclear Grievance',
      confidenceScore: 20,
      needsReview: true,
      matchedKeywords: [],
      reasoning: 'No text provided for deterministic classification.',
    };
  }

  // Cross-check numeric context if provided (e.g. Receipt price vs Packaging MRP)
  if (extraContext?.packagingMrp && extraContext?.receiptPrice) {
    const pkg = typeof extraContext.packagingMrp === 'number'
      ? extraContext.packagingMrp
      : parseFloat(String(extraContext.packagingMrp).replace(/[^0-9.]/g, ''));
    const rcp = typeof extraContext.receiptPrice === 'number'
      ? extraContext.receiptPrice
      : parseFloat(String(extraContext.receiptPrice).replace(/[^0-9.]/g, ''));

    if (!isNaN(pkg) && !isNaN(rcp) && rcp > pkg) {
      return {
        categoryCode: 'price_above_mrp',
        categoryLabel: 'Altered / Dual MRP Sticker on Packaging',
        confidenceScore: 98,
        needsReview: false,
        matchedKeywords: ['numeric_price_discrepancy', `mrp:${pkg}`, `sticker:${rcp}`],
        reasoning: `Extracted altered sticker price (₹${rcp}) differs from base product packaging MRP (₹${pkg}) by ₹${(rcp - pkg).toFixed(2)}.`,
      };
    }
  }

  const categoryScores: {
    definition: CategoryPatternDefinition;
    score: number;
    matchedTerms: string[];
  }[] = [];

  for (const def of CATEGORY_PATTERNS) {
    let score = 0;
    const matchedTerms: string[] = [];

    // 1. Regex match check (highest weight: 45 pts)
    for (const rx of def.regexes) {
      if (rx.test(normalized) || rx.test(rawText)) {
        score += 45;
        matchedTerms.push(`Regex hit: ${rx.source}`);
      }
    }

    // 2. Exact phrase match check (35 pts)
    for (const phrase of def.phrases) {
      const normPhrase = normalizeComplaintText(phrase);
      if (normPhrase && normalized.includes(normPhrase)) {
        score += 35;
        matchedTerms.push(`Phrase: "${phrase}"`);
      }
    }

    // 3. Keyword hit check (12 pts each)
    for (const kw of def.keywords) {
      const normKw = normalizeComplaintText(kw);
      if (normKw) {
        // Escaped unicode keyword matching
        const kwRegex = new RegExp(`(?:^|\\s)${normKw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}(?:$|\\s)`, 'iu');
        if (kwRegex.test(normalized)) {
          score += 12;
          matchedTerms.push(`Keyword: "${kw}"`);
        }
      }
    }

    if (score > 0) {
      categoryScores.push({
        definition: def,
        score: Math.min(99, score),
        matchedTerms,
      });
    }
  }

  // Sort by score descending
  categoryScores.sort((a, b) => b.score - a.score);

  if (categoryScores.length === 0 || categoryScores[0].score < 25) {
    return {
      categoryCode: 'other_unclear',
      categoryLabel: 'Other / Unclear Grievance',
      confidenceScore: 35,
      needsReview: true,
      matchedKeywords: [],
      reasoning: 'Text pattern match confidence below deterministic threshold. Routed for officer review.',
    };
  }

  const topMatch = categoryScores[0];
  const confidenceScore = topMatch.score;
  const needsReview = confidenceScore < 60;

  return {
    categoryCode: topMatch.definition.code,
    categoryLabel: topMatch.definition.label,
    confidenceScore,
    needsReview,
    matchedKeywords: topMatch.matchedTerms,
    reasoning: `Matched ${topMatch.matchedTerms.length} deterministic rules with ${confidenceScore}% confidence.`,
  };
}
