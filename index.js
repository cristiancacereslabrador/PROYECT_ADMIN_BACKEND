import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import conectarDB from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";

// const express = require("express");
const app = express();
app.use(express.json());
//NUEVA INSERCION PARA ARREGLAR EL CORS****************
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });
//NUEVA INSERCION PARA ARREGLAR EL CORS****************
dotenv.config();
conectarDB();
//CONFIGURAR CORS
//ORIGINAL***********************************
const whiteList = [
  "https://proyect-admin.netlify.app" ||
    "http://localhost:5173" ||
    "http://127.0.0.1:5173" ||
    process.env.FRONTEND_URL ||
    "http://localhost:4000" ||
    "ac-z33wzax-shad-00-01.tx898dy.mongodb.net:27017",
];
// const whiteList = [
//   "http://127.0.0.1:5173" ||
//     process.env.FRONTEND_URL ||
//     "ac-z33wzax-shad-00-01.tx898dy.mongodb.net:27017" ||
//     "http://localhost:5173",
// ];
const corsOptions = {
  origin: function (origin, callback) {
    // console.log("origin", origin);
    if (whiteList.includes(origin)) {
      //PUEDE CONSULTAR LA API
      callback(null, true);
    } else {
      //NO ESTA PERMITIDO SU REQUEST
      callback(new Error("Error de CORS"));
    }
  },
};
app.use(cors(corsOptions));
//ORIGINAL***********************************
//MODIFICADO PARA QUE ME PERMISA USAR POSTMAN AL TIEMPO SIN PROBLEMAS CON CORS ******************************
// const whiteList = [
//   process.env.FRONTEND_URL ||
//     "http://localhost:5173" ||
//     "http://localhost:4000" ||
//     "ac-z33wzax-shard-00-01.tx898dy.mongodb.net:27017",
// ];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin) {
//       // Postman request have not origin
//       return callback(null, true);
//     } else if (whiteList.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Error de CORS"));
//     }
//   },
// };
// app.use(cors(corsOptions));
//MODIFICADO PARA QUE ME PERMISA USAR POSTMAN AL TIEMPO SIN PROBLEMAS CON CORS ******************************
//Routing
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/proyectos", proyectoRoutes);
app.use("/api/tareas", tareaRoutes);

const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

//SOCKET.IO
import { Server } from "socket.io";

const io = new Server(servidor, {
  pingTimeout: 60000,
  // cors: { origin: "http://127.0.0.1:5173" },
  // cors: { origin: "http://localhost:5173" },
  //cors: { origin: process.env.FRONTEND_URL },
  cors: { "https://proyect-admin.netlify.app" },
});

io.on("connection", (socket) => {
  console.log("Conectado a socket.io");
  //DEFINIR LOS EVENTOS DE SOCKET IO
  // // socket.on("prueba", (proyectos) => {
  // //   // console.log("prueba desde soket io", proyecto);
  // //   console.log("RECIBIENDO PROYECTOS DESDE EL FRONTEND", proyectos);
  // //   socket.emit("respuesta", { nombre: "Cristian" });
  // // });

  socket.on("Abrir Proyecto", (proyecto) => {
    // console.log("desde el proyecto", proyecto);
    socket.join(proyecto);
    // socket
    //   .to("63af699ceacc2703844f5572")
    //   .emit("respuesta", { nombre: "Cristian" });
  });
  socket.on("Nueva Tarea", (tarea) => {
    // console.log("tarea", tarea);
    const proyecto = tarea.proyecto;
    //EMITIR UN NUEVO EVENTO PARA CONSUMIR EN EL FRONTEND
    socket.to(proyecto).emit("Tarea Agregada", tarea);
  });
  //ELIMINAR
  socket.on("Eliminar Tarea", (tarea) => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit("Tarea Eliminada", tarea);
  });
  //ACTUALIZAR
  socket.on("Actualizar Tarea", (tarea) => {
    // console.log("tarea", tarea);
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit("Tarea Actualizada", tarea);
  });
  //CAMBIAR ESTADO
  socket.on("Cambiar Estado", (tarea) => {
    // console.log("tarea", tarea);
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit("Nuevo Estado", tarea);
  });
});
