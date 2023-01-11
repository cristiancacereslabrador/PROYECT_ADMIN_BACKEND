import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";
import Usuario from "../models/Usuario.js";

const obtenerProyectos = async (req, res) => {
  const proyectos = await Proyecto.find({
    '$or': [ 
      {'colaboradores': {$in: req.usuario}},
      {'creador': {$in: req.usuario}},
    ]
  }).select("-tareas");
  res.json(proyectos);
  // console.log("proyectos", proyectos);
};
const nuevoProyecto = async (req, res) => {
  // console.log("req.body", req.body);
  // console.log("req.usuario", req.usuario);
  const proyecto = new Proyecto(req.body);
  proyecto.creador = req.usuario._id;

  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);
  } catch (error) {
    console.log("error1", error);
  }
};
const obtenerProyecto = async (req, res) => {
  const { id } = req.params;
  // console.log("id :>> ", id);
  const proyecto = await Proyecto.findById(id)
    .populate({ path: "tareas", populate: {path: "completado", select: "nombre"} })
    .populate("colaboradores", "nombre email");
  // console.log("proyecto", proyecto);
  if (!proyecto) {
    // return res.status(404).json({ msg: "No Encontrado" });
    const error = new Error("No Encontrado");
    return res.status(404).json({ msg: error.message });
  }
  // console.log("proyecto?.creador", proyecto?.creador);
  // console.log("req.usuario._id :>> ", req.usuario._id);
  // console.log(
  //   "compare2",
  //   proyecto?.creador.toString() === req.usuario._id.toString()
  // );
  if (proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString()) ){
    const error = new Error("Acción no válida");
    return res.status(401).json({ msg: error.message });
  }

  //   .populate({
  //     path: "tareas",
  //     populate: { path: "completado", select: "nombre" },
  //   })
  //   .populate("colaboradores", "nombre email");

  //Obtener las tareas del proyecto
  // const tareas = await Tarea.find().where("proyecto").equals(proyecto._id);
  // res.json({ proyecto, tareas });
  res.json(proyecto);
};
const editarProyecto = async (req, res) => {
  const { id } = req.params;
  // console.log("id :>> ", id);
  const proyecto = await Proyecto.findById(id);
  // console.log("proyecto", proyecto);
  if (!proyecto) {
    const error = new Error("No Encontrado");
    return res.status(404).json({ msg: error.message });
  }
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(401).json({ msg: error.message });
  }
  proyecto.nombre = req.body.nombre || proyecto.nombre;
  proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
  proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
  proyecto.cliente = req.body.cliente || proyecto.cliente;
  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);
  } catch (error) {
    console.log("error :>> ", error);
  }
};
const eliminarProyecto = async (req, res) => {
  const { id } = req.params;
  // console.log("id :>> ", id);
  const proyecto = await Proyecto.findById(id);
  // console.log("proyecto", proyecto);
  if (!proyecto) {
    // const error = new Error("No Encontrado");
    // return res.status(404).json({ msg: error.message });
    return res.status(404).json({ msg: "No Encontrado" });
  }
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(401).json({ msg: error.message });
  }
  try {
    await proyecto.deleteOne();
    res.json({ msg: "Proyecto Eliminado" });
  } catch (error) {
    console.log("error", error);
  }
};
const buscarColaborador = async (req, res) => {
  // console.log("req.body", req.body);
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createdAt -password -token -updatedAt -__v"
  );
  if (!usuario) {
    const error = new Error("Usuario no encontrado!");
    return res.status(404).json({ msg: error.message });
  }
  res.json(usuario);
};

const agregarColaborador = async (req, res) => {
  // console.log("req.params.id", req.params.id);
  const proyecto = await Proyecto.findById(req.params.id);

  // VERIFICAR QUE EL PROYECTO EXISTA
  if (!proyecto) {
    const error = new Error("Proyecto no encontrado!");
    return res.status(404).json({ msg: error.message });
  }
  //VERIFICAR QUE QUIEN ESTA AGREGANDO EL PROYECTO ES LA PERSONA QUE LO CREO
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida!");
    return res.status(404).json({ msg: error.message });
  }
  // console.log("req.body", req.body);
  //VERIFICAR Q EL USUARIO EXISTA
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createdAt -password -token -updatedAt -__v"
  );
  if (!usuario) {
    const error = new Error("Usuario no encontrado!");
    return res.status(404).json({ msg: error.message });
  }
  // EL COLABORADOR NO ES EL ADMIN DEL PROYECTO
  if (proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error("El Creador del Proyecto no puede ser colaborador");
    return res.status(404).json({ msg: error.message });
  }
  //REVISAR QUE NO ESTE EL PROYECTO AGREGADO YA
  if (proyecto.colaboradores.includes(usuario._id)) {
    const error = new Error("El Usuario ya pertenece al Proyecto");
    return res.status(404).json({ msg: error.message });
  }
  //ESTA BIEN SE PUEDE AGREGAR
  proyecto.colaboradores.push(usuario._id);
  await proyecto.save();
  res.json({ msg: "Colaborador agregado correctamente" });
};

// const eliminarColaborador = async (req, res) => {
//   // console.log("req.params.id", req.params.id);
//   const proyecto = await Proyecto.findById(req.params.id);
//   // VERIFICAR QUE EL PROYECTO EXISTA
//   if (!proyecto) {
//     const error = new Error("Proyecto no encontrado!");
//     return res.status(404).json({ msg: error.message });
//   }
//   //VERIFICAR QUE QUIEN ESTA AGREGANDO EL PROYECTO ES LA PERSONA QUE LO CREO
//   if (proyecto.creador.toString() !== req.usuario._id.toString()) {
//     const error = new Error("Acción no válida!");
//     return res.status(404).json({ msg: error.message });
//   }
//   // console.log("req.body", req.body);
//   //ESTA BIEN SE PUEDE ELIMINAR
//   proyecto.colaboradores.pull(req.body.id);
//   console.log("proyecto==?", proyecto);
//   await proyecto.save();
//   res.json({ msg: "Colaborador Eliminado correctamente" });
// };
// const obtenerTareas = async (req, res) => {
//   const { id } = req.params;
//   const existeProyecto = await Proyecto.findById(id);
//   if (!existeProyecto) {
//     const error = new Error("No Encntrado");
//     return res.status(404).json({ msg: error.message });
//   }
//   //Tienes que ser el creador del proyecto o colaborador
//   const tareas = await Tarea.find().where("proyecto").equals(id);
//   res.json(tareas);
// };
const eliminarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  if (!proyecto) {
    const error = new Error("Proyecto No Encontrado");
    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(404).json({ msg: error.message });
  }
  // Esta bien, se puede eliminar
  proyecto.colaboradores.pull(req.body.id);
  console.log("proyecto salvadoo????", proyecto);
  await proyecto.save();
  res.json({ msg: "Colaborador Eliminado Correctamente" });
};

export {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  agregarColaborador,
  eliminarColaborador,
  buscarColaborador,
  // obtenerTareas,
};
