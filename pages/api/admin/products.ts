import { isValidObjectId } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../database';
import { IProduct } from '../../../interfaces';
import { Product } from '../../../models';


type Data = 
| {message: string}
| IProduct[]
| IProduct;


export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch (req.method) {
        case 'GET':
            
            return getProducts(req,res);
    
        case 'PUT':

            return updatedProduct(req,res);

        case 'POST':

            return createProduct(req,res);;

        default: 

            return res.status(400).json({ message: 'Bad request' })
    }

    
}

const getProducts = async(req: NextApiRequest, res: NextApiResponse<Data>) => {
    
    await db.connect();

    const products = await Product.find().sort({title: 'asc'}).lean();

    await db.disconnect()
    
    //TODO: Debemos actualizar las imagenes

    res.status(200).json( products )
}
const updatedProduct = async(req: NextApiRequest, res: NextApiResponse<Data>) => {
    
    const { _id='', images = []} = req.body as IProduct;

    if(!isValidObjectId){
        return res.status(400).json({message:'El id del producto no es válido'});
    }
    
    if(images.length < 2){
        return res.status(400).json({message:'Son necesarias mínimo 2 imagenes'});

    }

    //TODO: Posiblemente tendremos un localhost:3000/products/asasas.jpg

    try {
        
        await db.connect()
        const product = await Product.findById(_id);
        if(!product){
            await db.disconnect()  
            return res.status(404).json({message: 'No existe un producto con ese ID'});
        }

        //TODO: De eliminar imagenes en Cloudinary

        await product.update(req.body);
        await db.disconnect()  

        return res.status(200).json( product );
        
    } catch (error) {
        console.log(error);
        await db.disconnect() 
        return res.status(400).json({message: 'Revisar la consola del servidor'})
        
    }

}

const createProduct = async(req: NextApiRequest, res: NextApiResponse<Data>) => {

    const {images = []} = req.body as IProduct;
    
    if(images.length < 2){
        return res.status(400).json({ message: 'Se necesitan al menos dos imágenes'});
    }

    //TODO: Posiblemente tendremos un localhost:3000/products/asasas.jpg

    try {

        await db.connect(); 

        const productInDb = await Product.findOne({slug:req.body.slug});

        if(productInDb){
            await db.disconnect(); 
            return res.status(400).json({message: 'Ya existe un producto con ese Slug'})
        }

        const product = new Product(req.body);
        await product.save();
        await db.disconnect(); 

        res.status(201).json(product);

    } catch (error) {
        await db.disconnect();
        return res.status(400).json({message:'Revisar logs del servidor'})
    }
}

