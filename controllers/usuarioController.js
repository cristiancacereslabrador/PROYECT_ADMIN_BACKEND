import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailOlvidePassword, emailRegistro } from "../helpers/email.js";

const registrar = async (req, res) => {
  //EVITAR REGISTROS DUPLICADOS
  const { email } = req.body;
  const existeUsuario = await Usuario.findOne({ email });
  console.log(existeUsuario);
  if (existeUsuario) {
    const error = new Error("Usuario ya registrado");
    return res.status(400).json({ msg: error.message });
  }
  // console.log(req.body);
  try {
    const usuario = new Usuario(req.body);
    // console.log("usuario traido de postman", usuario);
    usuario.token = generarId();
    // const usuarioAlmacenado = await usuario.save();
    // res.json(usuarioAlmacenado);
    await usuario.save();
    //ENVIAR EL EMAIL DE CONFIRMACION
    // console.log("usuario :>> ", usuario);
    emailRegistro({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    });

    res.json({
      msg: "Usuario Creado Correctamente, Revisa tu Email para confirmar tu cuenta",
    });
  } catch (error) {
    console.log("error", error);
  }
};

const autenticar = async (req, res) => {
  const { email, password } = req.body;
  //Comprobar si el usuario existe
  const usuario = await Usuario.findOne({ email });
  // console.log("usuario", usuario);
  if (!usuario) {
    const error = new Error("El usuario no existe");
    return res.status(404).json({ msg: error.message });
  }
  //Comprobar si el usuario esta confirmado
  console.log("usuario", usuario);
  if (!usuario.confirmado) {
    const error = new Error("Tu cuenta no ha sido confirmada");
    return res.status(404).json({ msg: error.message });
  }
  //Comprobar el password
  if (await usuario.comprobarPassword(password)) {
    console.log("Password es correcto");
    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: generarJWT(usuario._id),
    });
  } else {
    // console.log("Es incorrecto :>> ");
    const error = new Error("El password es incorrecto");
    return res.status(403).json({ msg: error.message });
  }
};

const confirmar = async (req, res) => {
  const { token } = req.params;
  const usuarioConfirmar = await Usuario.findOne({ token });
  // console.log("usuarioConfirmar :>> ", usuarioConfirmar);
  if (!usuarioConfirmar) {
    const error = new Error("Token no válido");
    return res.status(403).json({ msg: error.message });
  }
  try {
    usuarioConfirmar.confirmado = true;
    usuarioConfirmar.token = "";
    await usuarioConfirmar.save();
    res.json({ msg: "Usuario Confirmado Correctamente" });
    // console.log("usuarioConfirmar :>> ", usuarioConfirmar);
  } catch (error) {
    console.log("error", error);
  }
};

async function olvidePassword(req, res) {
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email });
  // console.log("usuario", usuario);
  if (!usuario) {
    const error = new Error("El usuario no existe");
    return res.status(404).json({ msg: error.message });
  }
  try {
    usuario.token = generarId();
    // console.log("usuario", usuario);
    await usuario.save();
    //ENVIAR EMAIL
    emailOlvidePassword({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    });
    res.json({ msg: "Hemos enviado un email con las instrucciones" });
  } catch (error) {
    console.log("error :>> ", error);
  }
}

const comprobarToken = async (req, res) => {
  const { token } = req.params;
  const tokenValido = await Usuario.findOne({ token });
  if (tokenValido) {
    console.log("Token válido");
    res.json({ msg: "Token válido y el Usuario existe" });
  } else {
    console.log("Token no válido");
    const error = new Error("El Token no existe");
    return res.status(404).json({ msg: error.message });
  }
};

const nuevoPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  // console.log("token: ", token, "password: ", password);
  const usuario = await Usuario.findOne({ token });
  if (usuario) {
    // console.log("usuario :>> ", usuario);
    usuario.password = password;
    usuario.token = "";
    try {
      await usuario.save();
      res.json({ msg: "Password Modificado Correctamente" });
    } catch (error) {
      console.log("error", error);
    }
  } else {
    // console.log("Token no válido");
    const error = new Error("El Token no existe");
    return res.status(404).json({ msg: error.message });
  }
};

const perfil = async (req, res) => {
  // console.log("desde perfil");
  const { usuario } = req;
  res.json(usuario);
};

export {
  registrar,
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
};
