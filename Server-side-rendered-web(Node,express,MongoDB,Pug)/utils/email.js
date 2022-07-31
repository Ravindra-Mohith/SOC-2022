const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1)create transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '950bf894fdf581',
      pass: '94fa99bf15125a',
    },
  });
  //2)define Email options
  const mailOptions = {
    from: 'Ravindra Mohith <ravindramohith@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //3)send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
