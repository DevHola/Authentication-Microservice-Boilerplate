import nodemailer from 'nodemailer'
export const reusableMail = async (subject: string, content: string, to: string, from: string): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: '364d1386674e15',
        pass: 'a472a01d707e65'
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
