curl 'https://api.sarvam.ai/translate' \
  -H 'api-subscription-key: <YOUR_API_SUBSCRIPTION_KEY>' \
  -H 'content-type: application/json' \
  --data-raw '{
  "input": "Hey, talk like you normally do.\n\nKal office mein 3 meetings thi.\n2 chai breaks.\n1 deadline miss hui.\nAur haan — salary ₹45,000 credit ho gayi 😌\n\nWrite it in Hindi, English, Tamil, Telugu — or mix it freely.\nSee how:\n\"₹45,000\"\nbecomes\n\"४५,००० रुपये\"\n\nChoose your tone (Formal, Modern Colloquial, Classical Colloquial, Code Mixed),\npick numerals (Native or International),\nand adjust speaker gender where it fits.\n\nSarvam understands real Indian language.\nNot clean. Not perfect. Just real.\n\nGo ahead.\nType it how you'd say it.",
  "source_language_code": "en-IN",
  "target_language_code": "hi-IN",
  "speaker_gender": "Male",
  "mode": "formal",
  "model": "mayura:v1",
  "enable_preprocessing": false,
  "numerals_format": "native"
}'