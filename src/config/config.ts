import nodemailer from 'nodemailer'
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 400,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
})
export const reuseableMail = async (subject: string, content: string, to: string, from: string): Promise<void> => {
  await transporter.sendMail({
    from,
    to,
    subject,
    html: content

  })
}
