import { AlphabetCategory } from "@/models/JapaneseAlphabet";

export const japaneseAlphabetData: AlphabetCategory[] = [
  {
    type: "hiragana",
    name: "Hiragana",
    description: "Hệ thống chữ cái nguyên âm cơ bản trong tiếng Nhật dùng cho từ gốc Nhật.",
    groups: [
      {
        id: "hiragana-vowels",
        name: "Nguyên âm",
        characters: [
          { id: "a", character: "あ", romanization: "a", type: "hiragana" },
          { id: "i", character: "い", romanization: "i", type: "hiragana" },
          { id: "u", character: "う", romanization: "u", type: "hiragana" },
          { id: "e", character: "え", romanization: "e", type: "hiragana" },
          { id: "o", character: "お", romanization: "o", type: "hiragana" },
        ]
      },
      {
        id: "hiragana-k",
        name: "K Hàng",
        characters: [
          { id: "ka", character: "か", romanization: "ka", type: "hiragana" },
          { id: "ki", character: "き", romanization: "ki", type: "hiragana" },
          { id: "ku", character: "く", romanization: "ku", type: "hiragana" },
          { id: "ke", character: "け", romanization: "ke", type: "hiragana" },
          { id: "ko", character: "こ", romanization: "ko", type: "hiragana" },
        ]
      },
      {
        id: "hiragana-s",
        name: "S Hàng",
        characters: [
          { id: "sa", character: "さ", romanization: "sa", type: "hiragana" },
          { id: "shi", character: "し", romanization: "shi", type: "hiragana" },
          { id: "su", character: "す", romanization: "su", type: "hiragana" },
          { id: "se", character: "せ", romanization: "se", type: "hiragana" },
          { id: "so", character: "そ", romanization: "so", type: "hiragana" },
        ]
      },
      {
        id: "hiragana-t",
        name: "T Hàng",
        characters: [
          { id: "ta", character: "た", romanization: "ta", type: "hiragana" },
          { id: "chi", character: "ち", romanization: "chi", type: "hiragana" },
          { id: "tsu", character: "つ", romanization: "tsu", type: "hiragana" },
          { id: "te", character: "て", romanization: "te", type: "hiragana" },
          { id: "to", character: "と", romanization: "to", type: "hiragana" },
        ]
      },
      {
        id: "hiragana-n",
        name: "N Hàng",
        characters: [
          { id: "na", character: "な", romanization: "na", type: "hiragana" },
          { id: "ni", character: "に", romanization: "ni", type: "hiragana" },
          { id: "nu", character: "ぬ", romanization: "nu", type: "hiragana" },
          { id: "ne", character: "ね", romanization: "ne", type: "hiragana" },
          { id: "no", character: "の", romanization: "no", type: "hiragana" },
        ]
      },
      {
        id: "hiragana-h",
        name: "H Hàng",
        characters: [
          { id: "ha", character: "は", romanization: "ha", type: "hiragana" },
          { id: "hi", character: "ひ", romanization: "hi", type: "hiragana" },
          { id: "fu", character: "ふ", romanization: "fu", type: "hiragana" },
          { id: "he", character: "へ", romanization: "he", type: "hiragana" },
          { id: "ho", character: "ほ", romanization: "ho", type: "hiragana" },
        ]
      },
      {
        id: "hiragana-m",
        name: "M Hàng",
        characters: [
          { id: "ma", character: "ま", romanization: "ma", type: "hiragana" },
          { id: "mi", character: "み", romanization: "mi", type: "hiragana" },
          { id: "mu", character: "む", romanization: "mu", type: "hiragana" },
          { id: "me", character: "め", romanization: "me", type: "hiragana" },
          { id: "mo", character: "も", romanization: "mo", type: "hiragana" },
        ]
      },
      {
        id: "hiragana-y",
        name: "Y Hàng",
        characters: [
          { id: "ya", character: "や", romanization: "ya", type: "hiragana" },
          { id: "yu", character: "ゆ", romanization: "yu", type: "hiragana" },
          { id: "yo", character: "よ", romanization: "yo", type: "hiragana" },
        ]
      },
      {
        id: "hiragana-r",
        name: "R Hàng",
        characters: [
          { id: "ra", character: "ら", romanization: "ra", type: "hiragana" },
          { id: "ri", character: "り", romanization: "ri", type: "hiragana" },
          { id: "ru", character: "る", romanization: "ru", type: "hiragana" },
          { id: "re", character: "れ", romanization: "re", type: "hiragana" },
          { id: "ro", character: "ろ", romanization: "ro", type: "hiragana" },
        ]
      },
      {
        id: "hiragana-w",
        name: "W Hàng",
        characters: [
          { id: "wa", character: "わ", romanization: "wa", type: "hiragana" },
          { id: "wo", character: "を", romanization: "wo", type: "hiragana" },
        ]
      },
      {
        id: "hiragana-n-single",
        name: "N",
        characters: [
          { id: "n", character: "ん", romanization: "n", type: "hiragana" },
        ]
      },
      {
        id: "hiragana-dakuten",
        name: "Dakuten (Dấu biến âm)",
        characters: [
          { id: "ga", character: "が", romanization: "ga", type: "hiragana" },
          { id: "gi", character: "ぎ", romanization: "gi", type: "hiragana" },
          { id: "gu", character: "ぐ", romanization: "gu", type: "hiragana" },
          { id: "ge", character: "げ", romanization: "ge", type: "hiragana" },
          { id: "go", character: "ご", romanization: "go", type: "hiragana" },
          { id: "za", character: "ざ", romanization: "za", type: "hiragana" },
          { id: "ji", character: "じ", romanization: "ji", type: "hiragana" },
          { id: "zu", character: "ず", romanization: "zu", type: "hiragana" },
          { id: "ze", character: "ぜ", romanization: "ze", type: "hiragana" },
          { id: "zo", character: "ぞ", romanization: "zo", type: "hiragana" },
          { id: "da", character: "だ", romanization: "da", type: "hiragana" },
          { id: "di", character: "ぢ", romanization: "ji (di)", type: "hiragana" },
          { id: "du", character: "づ", romanization: "zu (du)", type: "hiragana" },
          { id: "de", character: "で", romanization: "de", type: "hiragana" },
          { id: "do", character: "ど", romanization: "do", type: "hiragana" },
          { id: "ba", character: "ば", romanization: "ba", type: "hiragana" },
          { id: "bi", character: "び", romanization: "bi", type: "hiragana" },
          { id: "bu", character: "ぶ", romanization: "bu", type: "hiragana" },
          { id: "be", character: "べ", romanization: "be", type: "hiragana" },
          { id: "bo", character: "ぼ", romanization: "bo", type: "hiragana" },
        ]
      },
      {
        id: "hiragana-handakuten",
        name: "Handakuten (Dấu nửa biến âm)",
        characters: [
          { id: "pa", character: "ぱ", romanization: "pa", type: "hiragana" },
          { id: "pi", character: "ぴ", romanization: "pi", type: "hiragana" },
          { id: "pu", character: "ぷ", romanization: "pu", type: "hiragana" },
          { id: "pe", character: "ぺ", romanization: "pe", type: "hiragana" },
          { id: "po", character: "ぽ", romanization: "po", type: "hiragana" },
        ]
      },
      {
        id: "hiragana-combinations",
        name: "Âm kết hợp",
        characters: [
          { id: "kya", character: "きゃ", romanization: "kya", type: "hiragana" },
          { id: "kyu", character: "きゅ", romanization: "kyu", type: "hiragana" },
          { id: "kyo", character: "きょ", romanization: "kyo", type: "hiragana" },
          { id: "sha", character: "しゃ", romanization: "sha", type: "hiragana" },
          { id: "shu", character: "しゅ", romanization: "shu", type: "hiragana" },
          { id: "sho", character: "しょ", romanization: "sho", type: "hiragana" },
          { id: "cha", character: "ちゃ", romanization: "cha", type: "hiragana" },
          { id: "chu", character: "ちゅ", romanization: "chu", type: "hiragana" },
          { id: "cho", character: "ちょ", romanization: "cho", type: "hiragana" },
          { id: "nya", character: "にゃ", romanization: "nya", type: "hiragana" },
          { id: "nyu", character: "にゅ", romanization: "nyu", type: "hiragana" },
          { id: "nyo", character: "にょ", romanization: "nyo", type: "hiragana" },
        ]
      },
    ]
  },
  {
    type: "katakana",
    name: "Katakana",
    description: "Hệ thống chữ cái tiếng Nhật chủ yếu dùng cho từ nước ngoài và nhấn mạnh.",
    groups: [
      {
        id: "katakana-vowels",
        name: "Nguyên âm",
        characters: [
          { id: "a-k", character: "ア", romanization: "a", type: "katakana" },
          { id: "i-k", character: "イ", romanization: "i", type: "katakana" },
          { id: "u-k", character: "ウ", romanization: "u", type: "katakana" },
          { id: "e-k", character: "エ", romanization: "e", type: "katakana" },
          { id: "o-k", character: "オ", romanization: "o", type: "katakana" },
        ]
      },
      {
        id: "katakana-k",
        name: "K Hàng",
        characters: [
          { id: "ka-k", character: "カ", romanization: "ka", type: "katakana" },
          { id: "ki-k", character: "キ", romanization: "ki", type: "katakana" },
          { id: "ku-k", character: "ク", romanization: "ku", type: "katakana" },
          { id: "ke-k", character: "ケ", romanization: "ke", type: "katakana" },
          { id: "ko-k", character: "コ", romanization: "ko", type: "katakana" },
        ]
      },
      {
        id: "katakana-s",
        name: "S Hàng",
        characters: [
          { id: "sa-k", character: "サ", romanization: "sa", type: "katakana" },
          { id: "shi-k", character: "シ", romanization: "shi", type: "katakana" },
          { id: "su-k", character: "ス", romanization: "su", type: "katakana" },
          { id: "se-k", character: "セ", romanization: "se", type: "katakana" },
          { id: "so-k", character: "ソ", romanization: "so", type: "katakana" },
        ]
      },
      {
        id: "katakana-t",
        name: "T Hàng",
        characters: [
          { id: "ta-k", character: "タ", romanization: "ta", type: "katakana" },
          { id: "chi-k", character: "チ", romanization: "chi", type: "katakana" },
          { id: "tsu-k", character: "ツ", romanization: "tsu", type: "katakana" },
          { id: "te-k", character: "テ", romanization: "te", type: "katakana" },
          { id: "to-k", character: "ト", romanization: "to", type: "katakana" },
        ]
      },
      {
        id: "katakana-n",
        name: "N Hàng",
        characters: [
          { id: "na-k", character: "ナ", romanization: "na", type: "katakana" },
          { id: "ni-k", character: "ニ", romanization: "ni", type: "katakana" },
          { id: "nu-k", character: "ヌ", romanization: "nu", type: "katakana" },
          { id: "ne-k", character: "ネ", romanization: "ne", type: "katakana" },
          { id: "no-k", character: "ノ", romanization: "no", type: "katakana" },
        ]
      },
      {
        id: "katakana-h",
        name: "H Hàng",
        characters: [
          { id: "ha-k", character: "ハ", romanization: "ha", type: "katakana" },
          { id: "hi-k", character: "ヒ", romanization: "hi", type: "katakana" },
          { id: "fu-k", character: "フ", romanization: "fu", type: "katakana" },
          { id: "he-k", character: "ヘ", romanization: "he", type: "katakana" },
          { id: "ho-k", character: "ホ", romanization: "ho", type: "katakana" },
        ]
      },
      {
        id: "katakana-m",
        name: "M Hàng",
        characters: [
          { id: "ma-k", character: "マ", romanization: "ma", type: "katakana" },
          { id: "mi-k", character: "ミ", romanization: "mi", type: "katakana" },
          { id: "mu-k", character: "ム", romanization: "mu", type: "katakana" },
          { id: "me-k", character: "メ", romanization: "me", type: "katakana" },
          { id: "mo-k", character: "モ", romanization: "mo", type: "katakana" },
        ]
      },
      {
        id: "katakana-y",
        name: "Y Hàng",
        characters: [
          { id: "ya-k", character: "ヤ", romanization: "ya", type: "katakana" },
          { id: "yu-k", character: "ユ", romanization: "yu", type: "katakana" },
          { id: "yo-k", character: "ヨ", romanization: "yo", type: "katakana" },
        ]
      },
      {
        id: "katakana-r",
        name: "R Hàng",
        characters: [
          { id: "ra-k", character: "ラ", romanization: "ra", type: "katakana" },
          { id: "ri-k", character: "リ", romanization: "ri", type: "katakana" },
          { id: "ru-k", character: "ル", romanization: "ru", type: "katakana" },
          { id: "re-k", character: "レ", romanization: "re", type: "katakana" },
          { id: "ro-k", character: "ロ", romanization: "ro", type: "katakana" },
        ]
      },
      {
        id: "katakana-w",
        name: "W Hàng",
        characters: [
          { id: "wa-k", character: "ワ", romanization: "wa", type: "katakana" },
          { id: "wo-k", character: "ヲ", romanization: "wo", type: "katakana" },
        ]
      },
      {
        id: "katakana-n-single",
        name: "N",
        characters: [
          { id: "n-k", character: "ン", romanization: "n", type: "katakana" },
        ]
      },
      {
        id: "katakana-special",
        name: "Ký tự đặc biệt",
        characters: [
          { id: "long-vowel", character: "ー", romanization: "chỉ kéo dài nguyên âm", type: "katakana" },
          { id: "va", character: "ヴァ", romanization: "va", type: "katakana" },
          { id: "vi", character: "ヴィ", romanization: "vi", type: "katakana" },
          { id: "vu", character: "ヴ", romanization: "vu", type: "katakana" },
          { id: "ve", character: "ヴェ", romanization: "ve", type: "katakana" },
          { id: "vo", character: "ヴォ", romanization: "vo", type: "katakana" },
        ]
      }
    ]
  },
  {
    type: "kanji",
    name: "Kanji",
    description: "Chữ Hán được áp dụng cho tiếng Nhật đại diện cho các khái niệm và ý tưởng.",
    groups: [
      {
        id: "kanji-n5",
        name: "JLPT N5 (Cơ bản)",
        characters: [
          { 
            id: "hito", 
            character: "人", 
            romanization: "hito", 
            type: "kanji", 
            meaning: "người",
            examples: [
              { word: "人間", reading: "ningen", meaning: "con người" },
              { word: "外国人", reading: "gaikokujin", meaning: "người nước ngoài" }
            ]
          },
          { 
            id: "yama", 
            character: "山", 
            romanization: "yama", 
            type: "kanji", 
            meaning: "núi",
            examples: [
              { word: "山々", reading: "yamayama", meaning: "những ngọn núi" },
              { word: "火山", reading: "kazan", meaning: "núi lửa" }
            ]
          },
          { 
            id: "kawa", 
            character: "川", 
            romanization: "kawa", 
            type: "kanji", 
            meaning: "sông",
            examples: [
              { word: "河川", reading: "kasen", meaning: "sông ngòi" }
            ]
          },
          { 
            id: "hi", 
            character: "日", 
            romanization: "hi/nichi", 
            type: "kanji", 
            meaning: "ngày/mặt trời",
            examples: [
              { word: "日本", reading: "nihon", meaning: "Nhật Bản" },
              { word: "今日", reading: "kyou", meaning: "hôm nay" }
            ]
          },
          { 
            id: "tsuki", 
            character: "月", 
            romanization: "tsuki/getsu", 
            type: "kanji", 
            meaning: "tháng/mặt trăng",
            examples: [
              { word: "一月", reading: "ichigatsu", meaning: "tháng Một" },
              { word: "月曜日", reading: "getsuyoubi", meaning: "thứ Hai" }
            ]
          },
        ]
      },
      {
        id: "kanji-n4",
        name: "JLPT N4",
        characters: [
          { 
            id: "ai", 
            character: "愛", 
            romanization: "ai", 
            type: "kanji", 
            meaning: "tình yêu",
            examples: [
              { word: "愛情", reading: "aijou", meaning: "tình cảm" }
            ]
          },
          { 
            id: "iku", 
            character: "行", 
            romanization: "iku/gyou", 
            type: "kanji", 
            meaning: "đi/hàng",
            examples: [
              { word: "行く", reading: "iku", meaning: "đi" },
              { word: "銀行", reading: "ginkou", meaning: "ngân hàng" }
            ]
          },
          { 
            id: "shigoto", 
            character: "仕事", 
            romanization: "shigoto", 
            type: "kanji", 
            meaning: "công việc",
            examples: [
              { word: "仕事中", reading: "shigotochuu", meaning: "trong giờ làm việc" }
            ]
          }
        ]
      },
      {
        id: "kanji-numbers",
        name: "Số đếm",
        characters: [
          { 
            id: "ichi", 
            character: "一", 
            romanization: "ichi", 
            type: "kanji", 
            meaning: "một",
            examples: [
              { word: "一月", reading: "ichigatsu", meaning: "tháng Một" },
              { word: "一人", reading: "hitori", meaning: "một người" }
            ]
          },
          { 
            id: "ni", 
            character: "二", 
            romanization: "ni", 
            type: "kanji", 
            meaning: "hai",
            examples: [
              { word: "二日", reading: "futsuka", meaning: "ngày mùng 2" },
              { word: "二人", reading: "futari", meaning: "hai người" }
            ]
          },
          { 
            id: "san", 
            character: "三", 
            romanization: "san", 
            type: "kanji", 
            meaning: "ba",
            examples: [
              { word: "三日", reading: "mikka", meaning: "ngày mùng 3" },
              { word: "三角", reading: "sankaku", meaning: "tam giác" }
            ]
          },
          { 
            id: "shi-yon", 
            character: "四", 
            romanization: "shi/yon", 
            type: "kanji", 
            meaning: "bốn",
            examples: [
              { word: "四日", reading: "yokka", meaning: "ngày mùng 4" }
            ]
          },
          { 
            id: "go", 
            character: "五", 
            romanization: "go", 
            type: "kanji", 
            meaning: "năm",
            examples: [
              { word: "五日", reading: "itsuka", meaning: "ngày mùng 5" }
            ]
          },
        ]
      }
    ]
  }
]; 