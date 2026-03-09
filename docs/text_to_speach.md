curl 'https://api.sarvam.ai/text-to-speech' \
  -H 'api-subscription-key: <YOUR_API_SUBSCRIPTION_KEY>' \
  -H 'content-type: application/json' \
  --data-raw '{
  "text": "नमस्ते! Sarvam AI में आपका स्वागत है।\n\nहम भारतीय भाषाओं के लिए अत्याधुनिक voice technology बनाते हैं। हमारे text-to-speech models प्राकृतिक और इंसान जैसी आवाज़ें produce करते हैं, जो बेहद realistic लगती हैं।\n\nआप अपना text type कर सकते हैं या different voices को try करने के लिए किसी भी voice card पर play button पर click कर सकते हैं। तो चलिए, अपनी भाषा में AI की ताकत experience करें!",
  "target_language_code": "hi-IN",
  "speaker": "shubh",
  "pace": 1.1,
  "speech_sample_rate": 22050,
  "enable_preprocessing": true,
  "model": "bulbul:v3"
}'

const { SarvamAIClient } = require("sarvamai");

const client = new SarvamAIClient({
    apiSubscriptionKey: "SARVAM_API_KEY"
});

const response = await client.textToSpeech.convert({
    text: `नमस्ते! Sarvam AI में आपका स्वागत है।

हम भारतीय भाषाओं के लिए अत्याधुनिक voice technology बनाते हैं। हमारे text-to-speech models प्राकृतिक और इंसान जैसी आवाज़ें produce करते हैं, जो बेहद realistic लगती हैं।

आप अपना text type कर सकते हैं या different voices को try करने के लिए किसी भी voice card पर play button पर click कर सकते हैं। तो चलिए, अपनी भाषा में AI की ताकत experience करें!`,
    target_language_code: "hi-IN",
    speaker: "shubh",
    pace: 1.1,
    speech_sample_rate: 22050,
    enable_preprocessing: true,
    model: "bulbul:v3"
});

console.log(response);

--- steaming ---
const API_KEY = "YOUR_API_KEY";
const API_URL = "https://api.sarvam.ai/text-to-speech/stream";

async function streamTTS() {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "api-subscription-key": API_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text: `Hello! This is a streaming text-to-speech example.`,
            target_language_code: "hi-IN",
            speaker: "shubh",
            model: "bulbul:v3",
            pace: 1.1,
            speech_sample_rate: 22050,
            output_audio_codec: "mp3",
            enable_preprocessing: true
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Option 1: Play audio in real-time using MediaSource API
    if ("MediaSource" in window && MediaSource.isTypeSupported("audio/mpeg")) {
        const audio = new Audio();
        const mediaSource = new MediaSource();
        audio.src = URL.createObjectURL(mediaSource);
        
        mediaSource.addEventListener("sourceopen", async () => {
            const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
            const reader = response.body.getReader();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    mediaSource.endOfStream();
                    break;
                }
                
                // Wait for previous append to complete
                await new Promise(resolve => {
                    if (sourceBuffer.updating) {
                        sourceBuffer.addEventListener("updateend", resolve, { once: true });
                    } else {
                        resolve();
                    }
                });
                
                sourceBuffer.appendBuffer(value);
                console.log(`Received ${value.length} bytes`);
            }
        });
        
        audio.play();
    } else {
        // Option 2: Collect all chunks then play
        const chunks = [];
        const reader = response.body.getReader();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            console.log(`Received ${value.length} bytes`);
        }
        
        const blob = new Blob(chunks, { type: "audio/mpeg" });
        const audio = new Audio(URL.createObjectURL(blob));
        audio.play();
    }
}

streamTTS();