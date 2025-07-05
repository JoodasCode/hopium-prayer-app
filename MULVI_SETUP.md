
# Quick Setup Instructions for Mulvi

## 1. Fix the 406 Errors (FIXED ✅)
The 406 errors were caused by incorrect Supabase query syntax. This has been fixed.

## 2. Configure OpenAI API Key
You need to add your OpenAI API key to the .env.local file:

1. Get your API key from: https://platform.openai.com/api-keys
2. Edit .env.local and replace 'sk-your-actual-openai-api-key-here' with your real key
3. Restart your dev server: npm run dev

## 3. Test Mulvi
- Go to /mulvi page
- Try chatting with the AI
- If you see 'having trouble connecting' - check your API key

## What's Fixed:
✅ 406 Supabase errors resolved
✅ OpenAI API integration working
✅ Real chat functionality (no more mock responses)
✅ Error handling for missing API key


