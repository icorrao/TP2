import mongoose from "mongoose"



let productosSchema= new mongoose.Schema({
    titulo:String,
    nuevoPrecio:Number,
    viejoPrecio:Number,
    nuevoStock:Number,
    viejoStock:Number,
    codigo:Number,
    compania:Number,
    url:String,
    estadoActualizacion:String,



})

module.exports=mongoose.models('productos',productosSchema)