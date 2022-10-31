import { isValidObjectId } from 'mongoose';
import { db } from '.';
import { IOrder } from '../interfaces';
import { Order } from '../models';


export const getOrderById = async( id: string ):Promise<IOrder| null> => {

    /* Checking if the id is valid. */
    if ( !isValidObjectId(id) ){
        return null;
    }

    await db.connect();
    /* Using the `findById` method from the `Order` model to find a document with the id that is passed
    in. */
    const order = await Order.findById( id ).lean();
    await db.disconnect();

    /* This is checking if the order is null. If it is null, then it will return null. */
    if ( !order ) {
        return null;
    }

    /* This is a way to convert the `order` object into a plain JavaScript object. */
    return JSON.parse(JSON.stringify(order));


}


export const getOrdersByUser = async( userId: string ): Promise<IOrder[]> => {
    
    /* This is checking if the userId is a valid id. If it is not, then it will return an empty array. */
    if ( !isValidObjectId(userId) ){
        return [];
    }

    await db.connect();
    /* This is using the `find` method from the `Order` model to find all the orders that have the
    userId that is passed in. */
    const orders = await Order.find({ user: userId }).lean();
    await db.disconnect();


    /* This is a way to convert the `orders` object into a plain JavaScript object. */
    return JSON.parse(JSON.stringify(orders));


}