import jwt from "jsonwebtoken";

const generarJWT = (id) => {
  // const { sign } = jwt;
  // return jwt.sign({ nombre: "Cristian" }, process.env.JWT_SECRET, {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default generarJWT;
