// link: '#', and firstName will be added via options
const EMAIL_CONTENT = {
  // After Registration
  ACTIVATE_YOUR_ACCOUNT: {
    subject: '[D.U.V LIVE] Verify your Email',
    title: 'Verify Your Email',
    contentTop:
      'You have successfully created your D.U.V Live account. Please click on the link below to complete your registration.',
    buttonText: 'Verify Email'
  },
  PASSWORD_RESET: {
    subject: '[D.U.V LIVE] Password Reset',
    title: 'Password Reset',
    contentTop:
      "You (or someone pretending to be you) requested a password reset for your account. If you didn't made this request you can ignore this email.",
    contentBottom:
      "If you didn't request a password reset, let us know as soon as possible",
    buttonText: 'Reset Password'
  }
};

export default EMAIL_CONTENT;

// Check your inbox for the email address associated with your Pinterest account.
// Look for a message with the subject line "Please confirm your email"
// Open the email and click Confirm your email.
