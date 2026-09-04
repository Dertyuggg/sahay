require('dotenv').config({ path: '../.env' });
const { generateText, parseBankingIntent } = require('./geminiService');

async function runTests() {
  console.log('--- Testing Gemini Integration ---');
  
  try {
    console.log('\n1. Testing Text Generation...');
    const reply = await generateText('Say hello in one word.');
    console.log('Response:', reply);
    
    console.log('\n2. Testing Intent Parsing (send_money)...');
    const intent1 = await parseBankingIntent('transfer 1000 rupees to dhyanesh');
    console.log('Parsed Intent 1:', JSON.stringify(intent1, null, 2));
    
    console.log('\n3. Testing Intent Parsing (check_balance)...');
    const intent2 = await parseBankingIntent('what is my current balance?');
    console.log('Parsed Intent 2:', JSON.stringify(intent2, null, 2));

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('\nTest failed:', error.message);
  }
}

runTests();
