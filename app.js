import ejs from "ejs";
import express from "express";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import path from "path";
import  bodyParser  from "body-parser";
import flash from "connect-flash";
import session from "express-session";
import methodOverride from "method-override";
import passport  from "passport";
import morgan from "morgan";
import mongoose from "mongoose";
import LocalStrategy  from 'passport-local';


//Routes
import formRouter from './routes/formulario.js'
import usuarios from './routes/usuarios.js'
// importar modelo
import Usuarios from './models/usuariosmodels.js'
import admin from './models/adminmodels.js'
//api
import { google } from 'googleapis';
import { datacatalog } from "googleapis/build/src/apis/datacatalog/index.js";
const client = google.books({ version: 'v1', auth: 'AIzaSyCHX_xBulCt_4opNIQcWCmc1MF6nwwBENY' }); // reemplazar x por tu api key
//

const app = express();
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

app.use(express.static('public'));
app.use('/node_modules', express.static('node_modules')); // Carpeta node_modules
app.set('view engine', 'ejs')
//middleware for method override
app.use(methodOverride('_method'));





//rutas
app.use(formRouter)
app.use(usuarios)


app.get("/", (req, res) => {
  res.render('pages/index.ejs')
});





// redireccionar a otras secciones de la pagina
// app.get('/articles',(req,res){
//   res.render('pages/seccion-a-redireccionar')
// })


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



app.listen(3000, () => {
  console.log("servidor ejecutado");
});
