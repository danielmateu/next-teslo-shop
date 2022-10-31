import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react';
import { db } from '../../../database';
import { IOrder } from '../../../interfaces';
import { Product, Order } from '../../../models';


type Data =
    | { message: string }
    | IOrder;

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {


    switch (req.method) {
        case 'POST':
            return createOrder(req, res);

        default:
            return res.status(400).json({ message: 'Bad request' })

    }


}

const createOrder = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    /* Destructuring the req.body object and assigning the values to the variables orderItems and
    total. */
    const { orderItems, total } = req.body as IOrder;


    /* Getting the session from the request. */
    const session: any = await getSession({ req });
    if (!session) {
        return res.status(401).json({ message: 'Debe de estar autenticado para hacer esto' });
    }


    /* Creating an array of the product ids that the user wants to buy. */
    const productsIds = orderItems.map(product => product._id);
    await db.connect();

    /* Getting the products from the database that the user wants to buy. */
    const dbProducts = await Product.find({ _id: { $in: productsIds } });

    try {

        /* Getting the price of each product and multiplying it by the quantity of that product. */
        const subTotal = orderItems.reduce((prev, current) => {
            /* Getting the price of the product that the user wants to buy. */
            const currentPrice = dbProducts.find(prod => prod.id === current._id)?.price;
            if (!currentPrice) {
                throw new Error('Verifique el carrito de nuevo, producto no existe');
            }

            return (currentPrice * current.quantity) + prev
        }, 0);


        /* Getting the tax rate from the environment variables. If the environment variable is not set,
        it will default to 0. */
        const taxRate = Number(process.env.NEXT_PUBLIC_TAX_RATE || 0);
        /* Getting the tax rate from the environment variables. If the environment variable is not set,
        it will default to 0. */
        const backendTotal = subTotal * (taxRate + 1);

        /* Checking if the total that the user sent is the same as the total that the backend
        calculated. */
        if (total !== backendTotal) {
            throw new Error('El total no cuadra, verifique con el administrador');
        }

        // Todo bien hasta este punto
        /* Getting the user id from the session. */
        const userId = session.user._id;
        /* Creating a new order with the data that the user sent and adding the isPaid property
        and the user property. */
        const newOrder = new Order({ ...req.body, isPaid: false, user: userId });
        /* Rounding the total to 2 decimal places. */
        newOrder.total = Math.round(newOrder.total * 100) / 100;

        await newOrder.save();
        await db.disconnect();

        return res.status(201).json(newOrder);



    } catch (error: any) {
        await db.disconnect();
        console.log(error);
        res.status(400).json({
            message: error.message || 'Revise logs del servidor'
        })
    }




    // return res.status(201).json( req.body );
}
