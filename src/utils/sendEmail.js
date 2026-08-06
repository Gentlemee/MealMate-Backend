const sendEmail = async ({ email, subject, message }) => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_EMAIL,
    SMTP_PASSWORD,
    SMTP_FROM,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_EMAIL || !SMTP_PASSWORD) {
    return false;
  }

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: SMTP_FROM || SMTP_EMAIL,
      to: email,
      subject,
      text: message,
    });

    return true;
  } catch (error) {
    return false;
  }
};

export default sendEmail;
