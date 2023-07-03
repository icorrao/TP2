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
const client = google.books({ version: 'v1', auth: API_KEY }); // reemplazar x por tu api key
//
//mongoose
import mongoose from "mongoose";
dotenv.config({path:'./.env'})
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
//schema de libros
import fs from "fs";

//router
const router = express.Router();

const app = express();



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
  res.locals.currentAdmin = req.user ? req.user.nombre : null;
next()

})

  



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
  q: '', // reemplazar x por nombre de libro
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

//funcion para conseguir los datos de la base
async function buscarEnBaseDeDatos() { //<--- mapea libros de la base de datos para utilizar en el archivo librosficcion.ejs
  try {
    // obtiene la referencia a la base de datos
    const db = mongoose.connection.db;

    // realiza la consulta a la colección "libros" y obtiene los resultados
    const libros = await db.collection('libros').find().toArray();

    // mapea los resultados
    return libros.map((libro) => ({
      title: libro.titulo,
      authors: libro.autor,
      publisher: libro.editorial,
      thumbnail: libro.imagen,
    }));
  } catch (error) {
    throw new Error('Error en la búsqueda de libros');
  }
}

// ruta a la seccion de ficcion
app.get('/ficcion', async (req, res) => {
  try {
    //obtener los libros de la base de datos
    const libros = await buscarEnBaseDeDatos();

    //renderizar "librosficcion" y pasar los libros como variable
    res.render('pages/partials/librosficcion', { books: libros }); //pasar los libros como variable "books"
  } catch (error) {
    console.error('Error en la búsqueda de libros:', error.message);
    res.render('error', { error: 'Error en la búsqueda de libros' });
  }
});
//

//pruebas
/*agregar libros a la base de mongodb

async function buscarYAgregarLibro(titulo) {
  try {
    //realiza la búsqueda en la API de Google Books
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(titulo)}&langRestrict=es&key=${API_KEY}`;
    const response = await axios.get(url);
    const book = response.data.items.find(item => item.volumeInfo.title === titulo); // Busca el libro con el título exacto

    //verifica si se encontró el libro
    if (!book) {
      throw new Error(`No se encontró el libro "${titulo}"`);
    }

    const { title, authors, publisher, imageLinks, categories, description } = book.volumeInfo;
    const thumbnail = imageLinks.thumbnail;
    const image = imageLinks; // Agregar la propiedad image con todos los enlaces de imagen disponibles

    const libroData = {
      titulo: title,
      genero: categories ? categories[0] : '', 
      autor: authors ? authors.join(', ') : '',
      descripcion: description || '',
      stock: 0,
      precio: 0,
      imagen: thumbnail,
      editorial: publisher || '',
      anioPublicacion: 0,
      ISBN: '',
      valoraciones: [],
      fechaCreacion: new Date()
    };
    const libro = new Libro(libroData);

    //guarda el libro en la base de datos
    await libro.save();

    console.log('Libro agregado correctamente');
  } catch (error) {
    console.error('Error al agregar el libro:', error.message);
  }
}


// ejecucion de funcion para agregar un libro
const tituloLibro = 'El psicoanalista'; <-- cambiar por cualquier titulo de libro
buscarYAgregarLibro(tituloLibro);
*/

//

app.listen(process.env.PUERTO, () => {
  console.log("servidor ejecutado");
});
