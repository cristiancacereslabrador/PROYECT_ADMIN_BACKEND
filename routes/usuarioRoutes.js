import express from "express";
const router = express.Router();
import {
  registrar,
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
} from "../controllers/usuarioController.js";

import checkAuth from "../middleware/checkAuth.js";
//Autenticacion, Registo y Confirmación de Usuarios
router.post("/", registrar); //Crea un nuevo usuario
router.post("/login", autenticar); //Autentica un usuario
router.get("/confirmar/:token", confirmar); //Confirma un usuario
router.post("/olvide-password", olvidePassword);
router.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword);

router.get("/perfil", checkAuth, perfil);

// router.post("/", (req, res) => {
//   res.send("Desde API/USUARIOS");
// });

// router.get("/confirmar", (req, res) => {
//   res.send("CONFIRMANDO USUARIOS");
// });

// router.post("/", (req, res) => {
//   res.send("Desde POST API/USUARIOS");
// });

// router.put("/", (req, res) => {
//   res.send("Desde PUT API/USUARIOS");
// });

// router.delete("/", (req, res) => {
//   res.send("Desde DELETE API/USUARIOS");
// });

export default router;
