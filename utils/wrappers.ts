import bcrypt from 'bcryptjs'
import { createTransport } from "nodemailer";
import { getEnv } from '@docsploit/espress/lib/utils';

export function hashPassword(password: string) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}
export function comparePassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}
export function sendMail(message: string, subject: string, email: string) {
  const nodemailer = createTransport({
    service: 'GMAIL',
    auth: {
      user: getEnv('EMAIL_USERNAME'),
      pass: getEnv('EMAIL_PASSWORD')
    }
  });
  return new Promise(
    (resolve, reject) => {
      nodemailer.sendMail({
        from: getEnv('EMAIL_USERNAME'),
        to: email,
        subject: subject,
        html: message
      }, (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      });
    }
  )
}
