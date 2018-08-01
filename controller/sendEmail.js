var email = require('../config.js').email;
var accounts = require('../config.js').accounts;
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  host: email.host,
  secureConnection: true, // use SSL
  auth: {
    user: email.user,
    pass: email.password
  }
});

/**
 * 发送邮件
 * @param contents
 */
module.exports = function (contents) {
  transporter.sendMail({
    from: email.user,
    to: email.toUser,
    subject: contents,
    text: accounts.Email + contents + new Date() || 'is test!'
  }, function (error, response) {
    if (error) {
      console.error(error);
    } else {
      console.log("Message sent: " + response.response);
    }

    transporter.close(); // 如果没用，关闭连接池
  });
};
