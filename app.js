import ejs from "ejs";
import express from "express";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();
import formRouter from './routes/formulario.js'
//axios
import axios from 'axios'
//path
import  path  from "path";
//api
const API_KEY = process.env.API_KEY;
import { google } from 'googleapis';
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
const puerto = 3000;
dotenv.config({path: './.env'})

app.use(formRouter)
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({extended:true})) //body parser
app.use(express.static('public'));
app.use('/node_modules', express.static('node_modules')); // Carpeta node_modules
 app.get("/", (req, res) => {
     res.render('pages/index')
 });

app.set('view engine', 'ejs')

//pruebas

app.get('/comprar', async (req, res) => {
  const query = req.query.buscar || '';

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


app.listen(puerto, () => {
  console.log("servidor ejecutado");
});
