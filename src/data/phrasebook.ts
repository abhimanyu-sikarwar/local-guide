export type PhraseCategory = "cab" | "shopping" | "food" | "hotel" | "emergency";

export interface Phrase {
  id: string;
  hindi: string;
  kannada: string;
  english: string;
  hindiRomanized: string;
  kannadaRomanized: string;
  category: PhraseCategory;
  tags?: string[];
}

export const PHRASES: Phrase[] = [
  // CAB / AUTO
  { id: "cab-1", hindi: "कितना लगेगा?", kannada: "ಎಷ್ಟಾಗುತ್ತೆ?", english: "How much?", hindiRomanized: "Kitna lagega?", kannadaRomanized: "Eshtagutte?", category: "cab" },
  { id: "cab-2", hindi: "मीटर से चलोगे?", kannada: "ಮೀಟರ್ ಪ್ರಕಾರ ಹೋಗ್ತೀರಾ?", english: "Will you go by meter?", hindiRomanized: "Meter se chaloge?", kannadaRomanized: "Meter prakara hogthira?", category: "cab" },
  { id: "cab-3", hindi: "यहाँ रोकना", kannada: "ಇಲ್ಲಿ ನಿಲ್ಲಿ", english: "Stop here", hindiRomanized: "Yahaan rokna", kannadaRomanized: "Illi nilli", category: "cab" },
  { id: "cab-4", hindi: "सीधे जाओ", kannada: "ನೇರ ಹೋಗಿ", english: "Go straight", hindiRomanized: "Seedha jao", kannadaRomanized: "Nera hogi", category: "cab" },
  { id: "cab-5", hindi: "बायें मुड़ो", kannada: "ಎಡಕ್ಕೆ ತಿರುಗಿ", english: "Turn left", hindiRomanized: "Baayen mudo", kannadaRomanized: "Edakke tirugi", category: "cab" },
  { id: "cab-6", hindi: "दायें मुड़ो", kannada: "ಬಲಕ್ಕೆ ತಿರುಗಿ", english: "Turn right", hindiRomanized: "Dayen mudo", kannadaRomanized: "Balakke tirugi", category: "cab" },
  { id: "cab-7", hindi: "AC चालू करो", kannada: "AC ಹಾಕಿ", english: "Turn on AC", hindiRomanized: "AC chaalu karo", kannadaRomanized: "AC haaki", category: "cab" },
  { id: "cab-8", hindi: "UPI लेते हो?", kannada: "UPI ತಗೋತೀರಾ?", english: "Do you accept UPI?", hindiRomanized: "UPI lete ho?", kannadaRomanized: "UPI tagothira?", category: "cab" },
  { id: "cab-9", hindi: "रसीद दो", kannada: "ರಸೀದಿ ಕೊಡಿ", english: "Give receipt", hindiRomanized: "Raseed do", kannadaRomanized: "Raseedi kodi", category: "cab" },
  // SHOPPING
  { id: "shop-1", hindi: "कितना है?", kannada: "ಎಷ್ಟು?", english: "How much?", hindiRomanized: "Kitna hai?", kannadaRomanized: "Eshtu?", category: "shopping" },
  { id: "shop-2", hindi: "थोड़ा सस्ता करो", kannada: "ಸ್ವಲ್ಪ ಕಮ್ಮಿ ಮಾಡಿ", english: "Give a discount", hindiRomanized: "Thoda sasta karo", kannadaRomanized: "Svalpa kammi maadi", category: "shopping" },
  { id: "shop-3", hindi: "यह साइज़ है?", kannada: "ಈ ಸೈಜ್ ಇದೆಯಾ?", english: "Is this size available?", hindiRomanized: "Yeh size hai?", kannadaRomanized: "Ee size ideya?", category: "shopping" },
  { id: "shop-4", hindi: "बैग दोगे?", kannada: "ಚೀಲ ಕೊಡ್ತೀರಾ?", english: "Will you give a bag?", hindiRomanized: "Bag doge?", kannadaRomanized: "Cheela kodthira?", category: "shopping" },
  { id: "shop-5", hindi: "कार्ड लेते हो?", kannada: "ಕಾರ್ಡ್ ತಗೋತೀರಾ?", english: "Do you accept card?", hindiRomanized: "Card lete ho?", kannadaRomanized: "Card tagothira?", category: "shopping" },
  { id: "shop-6", hindi: "रिटर्न होगा?", kannada: "ರಿಟರ್ನ್ ಆಗುತ್ತಾ?", english: "Can I return this?", hindiRomanized: "Return hoga?", kannadaRomanized: "Return agutta?", category: "shopping" },
  // FOOD
  { id: "food-1", hindi: "यह तीखा है?", kannada: "ಇದು ಖಾರವಾ?", english: "Is this spicy?", hindiRomanized: "Yeh teekha hai?", kannadaRomanized: "Idu khaarava?", category: "food" },
  { id: "food-2", hindi: "शाकाहारी है?", kannada: "ಶಾಖಾಹಾರಿ ಇದೆಯಾ?", english: "Is it vegetarian?", hindiRomanized: "Shakahari hai?", kannadaRomanized: "Shaakhahari ideya?", category: "food" },
  { id: "food-3", hindi: "पानी दो", kannada: "ನೀರು ಕೊಡಿ", english: "Give water", hindiRomanized: "Paani do", kannadaRomanized: "Neeru kodi", category: "food" },
  { id: "food-4", hindi: "बिल लाओ", kannada: "ಬಿಲ್ ಕೊಡಿ", english: "Bring the bill", hindiRomanized: "Bill lao", kannadaRomanized: "Bill kodi", category: "food" },
  { id: "food-5", hindi: "थोड़ा और दो", kannada: "ಇನ್ನು ಸ್ವಲ್ಪ ಕೊಡಿ", english: "Give a little more", hindiRomanized: "Thoda aur do", kannadaRomanized: "Innu svalpa kodi", category: "food" },
  { id: "food-6", hindi: "पैक कर दो", kannada: "ಪ್ಯಾಕ್ ಮಾಡಿ", english: "Pack it", hindiRomanized: "Pack kar do", kannadaRomanized: "Pack maadi", category: "food" },
  // HOTEL
  { id: "hotel-1", hindi: "चेक-इन कब है?", kannada: "ಚೆಕ್-ಇನ್ ಯಾವಾಗ?", english: "When is check-in?", hindiRomanized: "Check-in kab hai?", kannadaRomanized: "Check-in yaavaag?", category: "hotel" },
  { id: "hotel-2", hindi: "रूम तैयार है?", kannada: "ರೂಮ್ ರೆಡಿ ಇದೆಯಾ?", english: "Is the room ready?", hindiRomanized: "Room taiyar hai?", kannadaRomanized: "Room ready ideya?", category: "hotel" },
  { id: "hotel-3", hindi: "WiFi पासवर्ड क्या है?", kannada: "WiFi ಪಾಸ್ವರ್ಡ್ ಏನು?", english: "What is the WiFi password?", hindiRomanized: "WiFi password kya hai?", kannadaRomanized: "WiFi password enu?", category: "hotel" },
  { id: "hotel-4", hindi: "AC काम नहीं कर रहा", kannada: "AC ಕೆಲಸ ಮಾಡ್ತಿಲ್ಲ", english: "AC is not working", hindiRomanized: "AC kaam nahi kar raha", kannadaRomanized: "AC kelasa madtilla", category: "hotel" },
  { id: "hotel-5", hindi: "एक्स्ट्रा तौलिया चाहिए", kannada: "ಹೆಚ್ಚುವರಿ ಟವೆಲ್ ಬೇಕು", english: "Need extra towel", hindiRomanized: "Extra towel chahiye", kannadaRomanized: "Heccuvari towel beku", category: "hotel" },
  // EMERGENCY
  { id: "emr-1", hindi: "मुझे डॉक्टर चाहिए", kannada: "ನನಗೆ ಡಾಕ್ಟರ್ ಬೇಕು", english: "I need a doctor", hindiRomanized: "Mujhe doctor chahiye", kannadaRomanized: "Nanage doctor beku", category: "emergency" },
  { id: "emr-2", hindi: "पुलिस बुलाओ", kannada: "ಪೊಲೀಸ್ ಕರೆಯಿರಿ", english: "Call the police", hindiRomanized: "Police bulao", kannadaRomanized: "Police kareyiri", category: "emergency" },
  { id: "emr-3", hindi: "मेरा पर्स चोरी हुआ", kannada: "ನನ್ನ ಪರ್ಸ್ ಕಳ್ಳತನ ಆಯ್ತು", english: "My wallet was stolen", hindiRomanized: "Mera purse chori hua", kannadaRomanized: "Nanna purse kallathana aaytu", category: "emergency" },
  { id: "emr-4", hindi: "मैं रास्ता भटक गया हूँ", kannada: "ನಾನು ದಾರಿ ತಪ್ಪಿದ್ದೇನೆ", english: "I am lost", hindiRomanized: "Main raasta bhatak gaya hun", kannadaRomanized: "Naanu daari tappiddeene", category: "emergency" },
  { id: "emr-5", hindi: "एम्बुलेंस बुलाओ", kannada: "ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯಿರಿ", english: "Call an ambulance", hindiRomanized: "Ambulance bulao", kannadaRomanized: "Ambulance kareyiri", category: "emergency" },
  { id: "emr-6", hindi: "मुझे अस्पताल जाना है", kannada: "ನನಗೆ ಆಸ್ಪತ್ರೆಗೆ ಹೋಗಬೇಕು", english: "I need to go to hospital", hindiRomanized: "Mujhe hospital jaana hai", kannadaRomanized: "Nanage aspathreye hogabeku", category: "emergency" },
];

export const CATEGORY_META: Record<PhraseCategory, { label: string; emoji: string; color: string }> = {
  cab: { label: "Cab / Auto", emoji: "🚕", color: "yellow" },
  shopping: { label: "Shopping", emoji: "🛍️", color: "purple" },
  food: { label: "Food", emoji: "🍽️", color: "green" },
  hotel: { label: "Hotel", emoji: "🏨", color: "blue" },
  emergency: { label: "Emergency", emoji: "🆘", color: "red" },
};

export const QUICK_PHRASES = ["cab-1", "cab-3", "cab-4", "cab-8", "shop-1", "food-4"];

export function getPhrasesByCategory(category: PhraseCategory): Phrase[] {
  return PHRASES.filter((p) => p.category === category);
}
