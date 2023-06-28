import ejs from "ejs";
import express from "express";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import flash from "connect-flash";
import session from "express-session";
import methodOverride from "method-override";
import passport  from "passport";
import morgan from "morgan";
import LocalStrategy  from 'passport-local';


//Routes
import formRouter from './routes/formulario.js'
import usuarios from './routes/usuarios.js'
// importar modelo
import Usuarios from './models/usuariosmodels.js'
import admin from './models/adminmodels.js'
//axios
import axios from 'axios'
//path
import  path  from "path";
//api
const API_KEY = process.env.API_KEY;
import { google } from 'googleapis';
import { datacatalog } from "googleapis/build/src/apis/datacatalog/index.js";
const client = google.books({ version: 'v1', auth: 'AIzaSyCHX_xBulCt_4opNIQcWCmc1MF6nwwBENY' }); // reemplazar x por tu api key
//
//mongoose
import mongoose from "mongoose";
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoCluster = process.env.MONGO_CLUSTER;
const mongoDatabase = process.env.MONGO_DATABASE;
mongoose.connect(`mongodb+srv://${mongoUser}:${mongoPassword}@${mongoCluster}/${mongoDatabase}?retryWrites=true&w=majority`)
.then(() => {
  console.log("conectado a mongodb")
}).catch((error) => {
  console.log(error)
})
//body parser
import bodyParser from "body-parser";

const app = express();
<<<<<<< HEAD
dotenv.config({path:'./config.env'})


//middleware para sesiones
app.use(session({
  secret: 'se logeo en mi aplicacion',
  resave:true,
  saveUninitialized:true,
  
  
  }))

app.use(passport.initialize());
app.use(passport.session());


// Configuración de la estrategia de autenticación para usuarios comunes
passport.use('user', new LocalStrategy({ usernameField: 'email' }, Usuarios.authenticate()));
passport.serializeUser(Usuarios.serializeUser());
passport.deserializeUser(Usuarios.deserializeUser());

// Configuración de la estrategia de autenticación para administradores
passport.use('admin', new LocalStrategy({ usernameField: 'email' }, admin.authenticate()));
passport.serializeUser(admin.serializeUser());
passport.deserializeUser(admin.deserializeUser());
//middleware flash mensajes
app.use(flash());

// configuracion de middlware
app.use( (req,res, next)=>{
  res.locals.success_msg=req.flash(('success_msg'))
  res.locals.error_msg=req.flash(('error_msg'))
  res.locals.error = req.flash(('error'));
  res.locals.currentUser = req.user ? req.user.nombre : null;
next()

})

  

app.use(bodyParser.urlencoded({ extended: true }));
=======
const puerto = 3000;
dotenv.config({path: './.env'})
// Middleware para manejar datos de formulario
app.use(express.urlencoded({ extended: true }));
app.use(formRouter)
>>>>>>> 73a2d8cca25be213287432cbb84bcb4675dac6d6

app.use(express.static('public'));
app.use('/node_modules', express.static('node_modules')); // Carpeta node_modules
app.use(bodyParser.urlencoded({extended:true})) //body parser
app.use(express.static('public'));

app.set('view engine', 'ejs')
//middleware for method override
app.use(methodOverride('_method'));





//rutas
app.use(formRouter)
app.use(usuarios)


app.get("/", (req, res) => {
  res.render('pages/index.ejs')
});





//pruebas

app.get('/comprar', async (req, res) => {
  const query = req.query.buscar || '';

//prueba mostrar libros por consola
const response = await client.volumes.list({
  q: 'AIzaSyCHX_xBulCt_4opNIQcWCmc1MF6nwwBENY', // reemplazar x por nombre de libro
});


mongoose.connect('mongodb://127.0.0.1:27017/Biblioteca',{
  useNewUrlParser : true,
  useUnifiedTopology : true,
  //useCreateIndex : true


}).then(mensaje=>{

  console.log('la db se conecto')

});

  try {
    const books = await buscarPorConsulta(query);
    res.render('pages/partials/comprar', { books });
  } catch (error) {
    console.error('Error en la búsqueda de libros:', error.message);
    res.render('pages/comprar', { books: [] });
  }
});


async function buscarPorConsulta(query) {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=es&key=${API_KEY}`;
    const response = await axios.get(url);
    return response.data.items
      .filter((book) => book.volumeInfo && book.volumeInfo.language === 'es' && book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.thumbnail && book.volumeInfo.authors) // Filtrar libros con descripciones en castellano, con imagen y con autor
      .map((book) => ({
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors,
        publisher: book.volumeInfo.publisher,
        thumbnail: book.volumeInfo.imageLinks.thumbnail, // Utilizar la propiedad thumbnail de la API de Google Books
      }));
  } catch (error) {
    throw new Error('Error en la búsqueda de libros');
  }
}
//

app.listen(3000, () => {
  console.log("servidor ejecutado");
});
