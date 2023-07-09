import { name } from "ejs";
import express from "express";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import formRouter from './routes/formulario.js'



const app = express();
const puerto = 3030;
dotenv.config({path: './.env'})

app.use(formRouter)
app.use(express.urlencoded({ extended: false })); //leer el req.body
app.use(express.static('public'));
app.set('view engine', 'ejs')

// redireccionar a otras secciones de la pagina
// app.get('/articles',(req,res){
//   res.render('pages/seccion-a-redireccionar')
// })






app.listen(puerto, () => {
  console.log("servidor ejecutado");
});
