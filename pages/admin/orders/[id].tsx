
import { GetServerSideProps, NextPage } from 'next';


import { Box, Card, CardContent, Divider, Grid, Typography, Chip } from '@mui/material';
import { AirplaneTicketOutlined, CreditCardOffOutlined, CreditScoreOutlined } from '@mui/icons-material';

import { ShopLayout } from '../../../components/layouts/ShopLayout';
import { CartList, OrderSummary } from '../../../components/cart';
import { dbOrders } from '../../../database';
import { IOrder } from '../../../interfaces';
import { AdminLayout } from '../../../components/layouts';

/* Defining the type of the props that the component will receive. */
interface Props {
    order: IOrder;
}

const OrderPage: NextPage<Props> = ({ order }) => {



    const { shippingAddress } = order;


    return (
        <AdminLayout title='Resumen del pedido' 
        subTitle={`Id del pedido: ${order._id}`}
        icon = {<AirplaneTicketOutlined/>}
        >
            {/* <Typography variant='h1' component='h1'>Pedido: {order._id}</Typography> */}

            {
                order.isPaid
                    ? (
                        <Chip
                            sx={{ my: 2 }}
                            label="Pedido realizado"
                            variant='outlined'
                            color="success"
                            icon={<CreditScoreOutlined />}
                        />
                    ) :
                    (
                        <Chip
                            sx={{ my: 2 }}
                            label="Pendiente de pago"
                            variant='outlined'
                            color="error"
                            icon={<CreditCardOffOutlined />}
                        />
                    )
            }

            <Grid container className='fadeIn'>
                <Grid item xs={12} sm={7}>
                    <CartList products={order.orderItems} />
                </Grid>
                <Grid item xs={12} sm={5}>
                    <Card className='summary-card'>
                        <CardContent>
                            <Typography variant='h2'>Resumen ({order.numberOfItems} {order.numberOfItems > 1 ? 'productos' : 'producto'})</Typography>
                            <Divider sx={{ my: 1 }} />

                            <Box display='flex' justifyContent='space-between'>
                                <Typography variant='subtitle1'>Dirección de entrega</Typography>
                            </Box>


                            <Typography>{shippingAddress.firstName} {shippingAddress.lastName}</Typography>
                            <Typography>{shippingAddress.address} {shippingAddress.address2 ? `, ${shippingAddress.address2}` : ''}</Typography>
                            <Typography>{shippingAddress.city}, {shippingAddress.zip}</Typography>
                            <Typography>{shippingAddress.country}</Typography>
                            <Typography>{shippingAddress.phone}</Typography>

                            <Divider sx={{ my: 1 }} />


                            <OrderSummary
                                orderValues={{
                                    numberOfItems: order.numberOfItems,
                                    subTotal: order.subTotal,
                                    total: order.total,
                                    tax: order.tax,
                                }}
                            />

                            <Box sx={{ mt: 3 }} display="flex" flexDirection='column'>
                                {/* TODO */}

                                <Box display='flex' flexDirection='column' >
                                    {
                                        order.isPaid
                                            ? (
                                                <Chip
                                                    sx={{ my: 2 }}
                                                    label="Pedido realizado"
                                                    variant='outlined'
                                                    color="success"
                                                    icon={<CreditScoreOutlined />}
                                                />

                                            )
                                            : (
                                                <Chip
                                                    sx={{ my: 2 }}
                                                    label="Pendiente de pago"
                                                    variant='outlined'
                                                    color="error"
                                                    icon={<CreditCardOffOutlined />}
                                                />
                                            )
                                    }
                                </Box>

                            </Box>

                        </CardContent>
                    </Card>
                </Grid>
            </Grid>


        </AdminLayout>
    )
}


// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time


export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {

    /* Destructuring the query object and setting a default value of '' for the id property. */
    const { id = '' } = query;
    /* Getting the order from the database. */
    const order = await dbOrders.getOrderById(id.toString());

    /* If the order is not found, it redirects to the order history page. */
    if (!order) {
        return {
            redirect: {
                destination: '/admin/orders',
                permanent: false,
            }
        }
    }


    /* Returning the order object as a prop to the OrderPage component. */
    return {
        props: {
            order
        }
    }
}


export default OrderPage;