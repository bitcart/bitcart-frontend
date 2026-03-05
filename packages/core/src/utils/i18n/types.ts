/**
 * Valid ISO 3166-1 alpha-2 country codes
 */
export type ISO3166Region =
  | "AT" // Austria
  | "BE" // Belgium
  | "BG" // Bulgaria
  | "HR" // Croatia
  | "CY" // Cyprus
  | "CZ" // Czech Republic
  | "DK" // Denmark
  | "EE" // Estonia
  | "FI" // Finland
  | "FR" // France
  | "DE" // Germany
  | "GR" // Greece
  | "HU" // Hungary
  | "IE" // Ireland
  | "IT" // Italy
  | "LV" // Latvia
  | "LT" // Lithuania
  | "LU" // Luxembourg
  | "MT" // Malta
  | "NL" // Netherlands
  | "PL" // Poland
  | "PT" // Portugal
  | "RO" // Romania
  | "SK" // Slovakia
  | "SI" // Slovenia
  | "ES" // Spain
  | "SE" // Sweden
  | "GB" // United Kingdom
  | "CH" // Switzerland
  | "NO" // Norway
  | "IS" // Iceland
  | "LI" // Liechtenstein
  | "MC" // Monaco
  | "AD" // Andorra
  | "SM" // San Marino
  | "VA" // Vatican City
  | "AL" // Albania
  | "BA" // Bosnia and Herzegovina
  | "ME" // Montenegro
  | "MK" // North Macedonia
  | "RS" // Serbia
  | "MD" // Moldova
  | "UA" // Ukraine
  | "BY" // Belarus
  | "RU" // Russia
  | "TR" // Turkey
  | "GE" // Georgia
  | "AM" // Armenia
  | "AZ" // Azerbaijan
  | "US" // United States
  | "CA" // Canada
  | "MX" // Mexico
  | "BR" // Brazil
  | "AR" // Argentina
  | "AU" // Australia
  | "NZ" // New Zealand
  | "CN" // China
  | "JP" // Japan
  | "KR" // South Korea
  | "IN" // India
  | "ID" // Indonesia
  | "MY" // Malaysia
  | "SG" // Singapore
  | "TH" // Thailand
  | "VN" // Vietnam
  | "ZA" // South Africa
  | "NG" // Nigeria
  | "EG" // Egypt
  | "SA" // Saudi Arabia
  | "AE" // United Arab Emirates
  | "IL" // Israel
  | "UZ" // Uzbekistan

  // UN regions
  | "001" // World
  | "002" // Africa
  | "019" // Americas
  | "142" // Asia
  | "150" // Europe
  | "009" // Oceania|

  // Special regions
  | "419" // Latin America

/**
 * Map of valid ISO 639-1/639-2/639-3 language codes
 * Key: language code, Value: language name
 */
export type ISO639LanguageCode =
  | "en" // English
  | "es" // Spanish
  | "fr" // French
  | "de" // German
  | "zh" // Chinese
  | "ja" // Japanese
  | "ru" // Russian
  | "ar" // Arabic
  | "it" // Italian
  | "pt" // Portuguese
  | "bg" // Bulgarian
  | "hr" // Croatian
  | "cs" // Czech
  | "da" // Danish
  | "nl" // Dutch
  | "et" // Estonian
  | "fi" // Finnish
  | "el" // Greek
  | "hu" // Hungarian
  | "ga" // Irish
  | "lv" // Latvian
  | "lt" // Lithuanian
  | "lb" // Luxembourgish
  | "mt" // Maltese
  | "pl" // Polish
  | "ro" // Romanian
  | "sk" // Slovak
  | "sl" // Slovenian
  | "sv" // Swedish
  | "eu" // Basque
  | "ca" // Catalan
  | "gl" // Galician
  | "cy" // Welsh
  | "gd" // Scottish Gaelic
  | "fy" // Frisian
  | "se" // Northern Sami
  | "br" // Breton
  | "oc" // Occitan
  | "co" // Corsican
  | "sc" // Sardinian
  | "fur" // Friulian
  | "lld" // Ladin
  | "hsb" // Upper Sorbian
  | "dsb" // Lower Sorbian
  | "rm" // Romansh
  | "gsw" // Swiss German
  | "hi" // Hindi
  | "bn" // Bengali
  | "ko" // Korean
  | "tr" // Turkish
  | "fa" // Persian
  | "he" // Hebrew
  | "th" // Thai
  | "vi" // Vietnamese
  | "id" // Indonesian
  | "ms" // Malay
  | "uk" // Ukrainian
  | "be" // Belarusian
  | "sr" // Serbian
  | "mk" // Macedonian
  | "az" // Azerbaijani
  | "hy" // Armenian
  | "ka" // Georgian
  | "sq" // Albanian
  | "bs" // Bosnian
  | "no" // Norwegian
  | "nb" // Norwegian Bokmål
  | "nn" // Norwegian Nynorsk
  | "is" // Icelandic
  | "uz" // Uzbek
  | "tl" // Tagalog
  | "ht" // Haitian Creole
  | "nv" // Navajo
  | "chr" // Cherokee

  // Extended languages
  | "cmn" // Mandarin Chinese
  | "yue" // Cantonese Chinese
  | "cnr" // Montenegrin

/**
 * The most simplistic approximation of a
 * [POSIX locale identifier](https://en.wikipedia.org/wiki/Locale_(computer_software)#POSIX_platforms)
 * in the particular `language_TERRITORY` form
 * [as required by Open Graph](https://ogp.me/#optional).
 *
 * Note that this type WILL produce non-existent combinations in addition to valid ones,
 * as no validation against the actual registry is performed.
 */
export type PosixLocaleIdLike<TSupportedLocaleId extends ISO639LanguageCode> =
  `${TSupportedLocaleId}_${ISO3166Region}`

export type BCP47LanguageSubtag = ISO639LanguageCode

export type BCP47RegionSubtag = ISO3166Region

/**
 * The most simplistic approximation of a BCP 47 language subtag.
 *
 * Note that this type WILL produce non-existent combinations in addition to valid ones,
 * as no validation against the actual registry is performed.
 */
export type BCP47LanguageTagLike = `${BCP47LanguageSubtag}-${BCP47RegionSubtag}`

export type LocaleId = BCP47LanguageSubtag | BCP47LanguageTagLike
