import express from "express";


const app = express();
const puerto = 3000;


app.use(express.static('public'));

 app.get("/", (req, res) => {
     res.render('pages/index')
 });

app.set('view engine', 'ejs')

// redireccionar a otras secciones de la pagina
// app.get('/articles',(req,res){
//   res.render('pages/seccion-a-redireccionar')
// })

app.listen(puerto, () => {
  console.log("servidor ejecutado");
});
