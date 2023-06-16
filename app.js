import ejs from "ejs";
import express from "express";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import formRouter from './routes/formulario.js'
//api
import { google } from 'googleapis';
const client = google.books({ version: 'v1', auth: 'x' }); // reemplazar x por tu api key
//

const app = express();
const puerto = 3000;
dotenv.config({path: './.env'})

app.use(formRouter)
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use('/node_modules', express.static('node_modules')); // Carpeta node_modules

 app.get("/", (req, res) => {
     res.render('pages/index')
 });

app.set('view engine', 'ejs')

// redireccionar a otras secciones de la pagina
// app.get('/articles',(req,res){
//   res.render('pages/seccion-a-redireccionar')
// })


//prueba mostrar libros por consola
const response = await client.volumes.list({
  q: 'x', // reemplazar x por nombre de libro
});

console.log(response.data.items);




app.listen(puerto, () => {
  console.log("servidor ejecutado");
});
