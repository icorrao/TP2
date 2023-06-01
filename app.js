import { name } from "ejs";
import express from "express";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import formRouter from './routes/formulario.js'



const app = express();
const puerto = 3000;
dotenv.config({path: './.env'})

app.use(formRouter)
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
<<<<<<< HEAD
=======
app.use('/node_modules', express.static('node_modules')); // Carpeta node_modules

 app.get("/", (req, res) => {
     res.render('pages/index')
 });

>>>>>>> dcdf6590a57ff79a0da80f0ae0c715156ca6c857
app.set('view engine', 'ejs')

// redireccionar a otras secciones de la pagina
// app.get('/articles',(req,res){
//   res.render('pages/seccion-a-redireccionar')
// })











app.listen(puerto, () => {
  console.log("servidor ejecutado");
});
