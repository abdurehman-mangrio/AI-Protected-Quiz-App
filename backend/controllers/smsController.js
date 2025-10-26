import asyncHandler from 'express-async-handler';

// Browser SMS Controller - No API dependencies, completely free
const sendSMS = asyncHandler(async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({
      success: false,
      message: 'Phone number and message are required'
    });
  }

  // Format Pakistani number for SMS
  const formatPakistaniNumber = (phone) => {
    let cleanPhone = phone.replace(/\s+|[-+]/g, '');
    
    // Convert to international format for SMS
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '92' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('92')) {
      cleanPhone = '92' + cleanPhone;
    }
    
    return cleanPhone;
  };

  const formattedPhone = formatPakistaniNumber(to);
  const credentials = extractCredentials(message);
  
  // Create browser SMS URL
  const smsMessage = `CyberArena Login Credentials:\n\n📧 User ID: ${credentials.email}\n🔑 Password: ${credentials.password}\n\n🌐 Login: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login\n\n⚠️ Keep your credentials secure. Do not share with anyone.`;
  
  const smsUrl = `sms:${formattedPhone}?body=${encodeURIComponent(smsMessage)}`;

  res.status(200).json({
    success: true,
    message: 'Browser SMS ready to send',
    sms_url: smsUrl,
    phone: formattedPhone,
    provider: 'Browser SMS',
    instruction: 'Click the SMS button to open messaging app with pre-filled credentials'
  });
});

// Check SMS status (dummy function for compatibility)
const checkSMSBalance = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    balance: 'Browser SMS - Always Available',
    message: 'Browser SMS is free and always available'
  });
});

// Helper function to extract credentials from message
const extractCredentials = (message) => {
  const emailMatch = message.match(/User ID: ([^\n]+)/);
  const passwordMatch = message.match(/Password: ([^\n]+)/);
  
  return {
    email: emailMatch ? emailMatch[1].trim() : 'N/A',
    password: passwordMatch ? passwordMatch[1].trim() : 'N/A'
  };
};

export { sendSMS, checkSMSBalance };