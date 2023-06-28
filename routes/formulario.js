import express from 'express'
import nodemailer from 'nodemailer'
const router=express.Router()

// Get del footer
router.get("/politicas",(req,res)=>{
   res.render('pages/footer/politicas.ejs')


})
//Get del formulario
router.get('/enviar-correo',(req,res)=>{
  res.render('pages/correo/correo.ejs')
})



//Post formulario
router.post('/enviar-correo', async(req, res) => {
    const formData = req.body; // Obtiene los datos del formulario
    console.log(formData.email)
  
    // Transporte de Nodemailer, envía el correo electrónico
  
    const transporter = nodemailer.createTransport({
      
      // Configuración del servidor SMTP
      host:'smtp.gmail.com',  
      port : 587,
      user: '',
      pass:''
  });
  // Opciones del correo electrónico
    const mailOptions = {
     from:'',
     
        to:'diegocolman14@gmail.com',
        subjet:`nuevo mensaje de contacto ${formData.nombre}`,
        text:`
        Nombre ${formData.nombre}
        Correo ${formData.email}
        Mensaje ${formData.mensaje}`
     };
  
  
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.send('Error al enviar el correo electrónico');
      } else {
        console.log('Correo electrónico enviado: ' + info.response);
        res.send('Correo electrónico enviado correctamente');
        
      }
      
    });
  });





  export default router