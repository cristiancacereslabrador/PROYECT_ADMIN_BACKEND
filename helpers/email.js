import nodemailer from "nodemailer";

export const emailRegistro = async (datos) => {
  // console.log("datos", datos);
  const { email, nombre, token } = datos;
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //Informacion del email
  const info = await transport.sendMail({
    from: '"CACELAB - Administración de Proyectos" <cristiancacereslabrador@gmail.com>',
    to: email,
    subject: "CACELAB - Comprueba tu cuenta",
    text: "Comprueba tu cuenta en CACELAB",
    html: ` <p>Hola: ${nombre}  Comprueba tu cuenta en CACELAB</p>
    <p>Tu cuenta ya esta casi lista, solo debes comprobarla en el siguiente enlace:
    </p>  
    <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta</a> 

    <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>

    `,
  });
};
export const emailOlvidePassword = async (datos) => {
  // console.log("datos", datos);
  const { email, nombre, token } = datos;
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //Informacion del email
  const info = await transport.sendMail({
    from: '"CACELAB - Administración de Proyectos" <cristiancacereslabrador@gmail.com>',
    to: email,
    subject: "CACELAB - Reestablece tu password",
    text: "Reestablece tu password",
    html: ` <p>Hola: ${nombre}  has solicitado reestablecer tu password</p>
    <p>Sigue el siguiente enlace para generar tu nuevo password:
    </p>  
    <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablece tu password</a> 

    <p>Si tu no solicitaste este email, puedes ignorar el mensaje</p>

    `,
  });
};
