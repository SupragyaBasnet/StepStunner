const qr = require('qrcode');

async function testQRCode() {
  try {
    console.log('🧪 Testing QR Code Library...\n');
    
    const testUrl = 'otpauth://totp/StepStunner%20(test@example.com)?secret=TEST123&issuer=StepStunner';
    
    console.log('1. Testing QR code generation...');
    const dataUrl = await qr.toDataURL(testUrl);
    
    console.log('✅ QR Code generated successfully!');
    console.log('📱 Data URL starts with:', dataUrl.substring(0, 50) + '...');
    console.log('📱 Data URL length:', dataUrl.length);
    
    if (dataUrl.startsWith('data:image/png;base64,')) {
      console.log('✅ QR Code is a valid data URL!');
    } else {
      console.log('❌ QR Code is not a valid data URL');
    }
    
  } catch (error) {
    console.error('❌ QR Code test failed:', error.message);
  }
}

testQRCode(); 