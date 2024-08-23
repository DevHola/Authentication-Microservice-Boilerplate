import nodemailer from 'nodemailer'
const host = process.env.MAIL_HOST
const user = process.env.MAIL_USER
const pass = process.env.MAIL_PASS
export const reusableMail = async (subject: string, content: string, to: string, from: string): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      host,
      port: 2525,
      auth: {
        user,
        pass
      }
    })
    await transporter.sendMail({
      from,
      to,
      subject,
      html: content
    })
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`mailing failed - ${error.message}`)
    }
  }
}
