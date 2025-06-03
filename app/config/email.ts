export const emailConfig = {
  from: {
    name: "LifeLine Emergency Platform",
    email: "ur mail",
  },
  smtp: {
    service: "gmail", // Using Gmail service
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "ur mail",
      pass: "c", // Replace this with the App Password you generated
    },
  },
};
