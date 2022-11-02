import { FC, useContext } from 'react';
import NextLink from 'next/link';
import { Box, Button, CardActionArea, CardMedia, Grid, Link, Typography } from '@mui/material';

import { ItemCounter } from '../ui';
import { CartContext } from '../../context';
import { ICartProduct, IOrderItem } from '../../interfaces';


interface Props {
    editable?: boolean;
    products?: IOrderItem[];
}

export const CartList: FC<Props> = ({ editable = false, products }) => {

/* Destructuring the cart, updateCartQuantity and removeCartQuantity from the CartContext. */
    const { cart, updateCartQuantity, removeCartProduct } = useContext(CartContext);

    /**
     * The function takes a product and a new quantity value, and then updates the quantity of the
     * product to the new quantity value.
     * @param {ICartProduct} product - ICartProduct - this is the product that was updated
     * @param {number} newQuantityValue - The new quantity value that the user has entered.
     */
    const onNewCartQuantityValue = (product: ICartProduct, newQuantityValue: number) => {
        product.quantity = newQuantityValue;
        updateCartQuantity( product );
    }

    /* A ternary operator. It is saying that if the products props is defined, then use that, otherwise
    use the cart. */
    const productsToShow = products ? products : cart;


    return (
        <>
            {
                productsToShow.map( product => (
                    <Grid container spacing={2} key={ product.slug + product.size } sx={{ mb:1 }}>
                        <Grid item xs={3}>
                            {/* TODO: llevar a la página del producto */}
                            <NextLink href={`/product/${ product.slug }`} passHref>
                                <Link>
                                    <CardActionArea>
                                        <CardMedia 
                                            image={ product.image }
                                            component='img'
                                            sx={{ borderRadius: '5px' }}
                                        />
                                    </CardActionArea>
                                </Link>
                            </NextLink>
                        </Grid>
                        <Grid item xs={7}>
                            <Box display='flex' flexDirection='column'>
                                <Typography variant='body1'>{ product.title }</Typography>
                                <Typography variant='body1'>Talla: <strong>{ product.size }</strong></Typography>

                                {
                                    editable 
                                    ? (
                                        <ItemCounter 
                                            currentValue={ product.quantity }
                                            maxValue={ 10 } 
                                            updatedQuantity={ ( value ) => onNewCartQuantityValue(product as ICartProduct, value )}
                                        />
                                    )
                                    : (
                                        <Typography variant='h5'>{ product.quantity } { product.quantity > 1 ? 'productos':'producto' }</Typography>
                                    )
                                }
                                
                            </Box>
                        </Grid>
                        <Grid item xs={2} display='flex' alignItems='center' flexDirection='column'>
                            <Typography variant='subtitle1'>{ `€${ product.price }` }</Typography>
                            
                            {
                                editable && (
                                    <Button 
                                        variant='text' 
                                        color='secondary' 
                                        onClick={ () => removeCartProduct( product as ICartProduct ) }
                                    >
                                        Eliminar
                                    </Button>
                                )
                            }
                        </Grid>
                    </Grid>
                ))
            }
        </>
    )
}
