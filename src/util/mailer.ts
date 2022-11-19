import SMTPTransport from 'nodemailer/lib/smtp-transport'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport(
  new SMTPTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT as string),
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    }
  })
)
export { transporter }
