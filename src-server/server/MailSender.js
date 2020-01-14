'use strict';
import nodemailer from 'nodemailer';
import ejs from 'ejs';
import htmlToText from 'html-email-to-text';

const DUV_LIVE_NO_REPLY_EMAIL = 'DUV LIVE <no-reply@duvlive.com>';
const emailLogo = `http:localhost:4000/email-logo.png`;

export function generateEmailTemplate(options) {
  return new Promise((resolve, reject) => {
    return ejs.renderFile(
      __dirname + '/email-template/duv-html-email-template.ejs',
      { ...options, emailLogo },
      function(err, html) {
        if (err) {
          return reject(err);
        } else {
          const text = htmlToText(html);
          return resolve({ html, text });
        }
      }
    );
  });
}

// async..await is not allowed in global scope, must use a wrapper
// sendMail(EMAIL_CONTENT.ACTIVATE_YOUR_ACCOUNT, user, options)
export default async function sendMail(content, user, additionalOptions = {}) {
  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP || 'smtp.mailtrap.io',
    port: process.env.EMAIL_PORT || 2525,
    auth: {
      user: process.env.EMAIL_USER || process.env.MAIL_TRAP_USER,
      pass: process.env.EMAIL_Pass || process.env.MAIL_TRAP_PASS
    }
  });
  // ensure userEmail is always present

  // let subject = title ? title : 'Activate Your Duv Live Account';
  // let link = title
  //   ? `${global.host}/api/v1/users/update-password?token=${token}`
  //   : `${global.host}/api/v1/users/activate?token=${token}`;

  // Generate html mail
  const options = {
    ...content,
    ...additionalOptions,
    firstName: user.firstName
  };

  const { html, text } = await generateEmailTemplate(options);

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: DUV_LIVE_NO_REPLY_EMAIL, // sender address
    to: `${user.email}`, // list of receivers
    subject: `${options.subject}`, // Subject line
    text,
    html
  });

  console.log('Message sent: %s', info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
