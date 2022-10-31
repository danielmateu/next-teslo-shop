import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { PayPalButtons } from '@paypal/react-paypal-js';

import { Box, Card, CardContent, Divider, Grid, Typography, Chip, CircularProgress } from '@mui/material';
import { CreditCardOffOutlined, CreditScoreOutlined } from '@mui/icons-material';

import { ShopLayout } from '../../components/layouts/ShopLayout';
import { CartList, OrderSummary } from '../../components/cart';
import { dbOrders } from '../../database';
import { IOrder } from '../../interfaces';
import { tesloApi } from '../../api';


export type OrderResponseBody = {
    id: string;
    status:
    | "COMPLETED"
    | "SAVED"
    | "APPROVED"
    | "VOIDED"
    | "PAYER_ACTION_REQUIRED";
};


/* Defining the type of the props that the component will receive. */
interface Props {
    order: IOrder;
}

const OrderPage: NextPage<Props> = ({ order }) => {


    const router = useRouter();
    const { shippingAddress } = order;
    const [isPaying, setIsPaying] = useState(false);


    const onOrderCompleted = async (details: OrderResponseBody) => {

        if (details.status !== 'COMPLETED') {
            return alert('No hay pago en Paypal');
        }

        setIsPaying(true);

        try {

            const { data } = await tesloApi.post(`/orders/pay`, {
                transactionId: details.id,
                orderId: order._id
            });

            router.reload();

        } catch (error) {
            setIsPaying(false);
            console.log(error);
            alert('Error');
        }

    }



    return (
        <ShopLayout title='Resumen del pedido' pageDescription={'Resumen de la orden'}>
            <Typography variant='h1' component='h1'>Pedido: {order._id}</Typography>

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

                                <Box display="flex"
                                    justifyContent="center"
                                    className='fadeIn'
                                    sx={{ display: isPaying ? 'flex' : 'none' }}>
                                    <CircularProgress />
                                </Box>

                                <Box flexDirection='column' sx={{ display: isPaying ? 'none' : 'flex', flex: 1 }} >
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
                                                <PayPalButtons
                                                    createOrder={(data, actions) => {
                                                        return actions.order.create({
                                                            purchase_units: [
                                                                {
                                                                    amount: {
                                                                        value: `${order.total}`,
                                                                    },
                                                                },
                                                            ],
                                                        });
                                                    }}
                                                    onApprove={(data, actions) => {
                                                        return actions.order!.capture().then((details) => {
                                                            onOrderCompleted(details);
                                                            // console.log({ details  })
                                                            // const name = details.payer.name.given_name;
                                                            // alert(`Transaction completed by ${name}`);
                                                        });
                                                    }}
                                                />
                                            )
                                    }
                                </Box>

                            </Box>

                        </CardContent>
                    </Card>
                </Grid>
            </Grid>


        </ShopLayout>
    )
}


// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time


export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {

    /* Destructuring the query object and setting a default value of '' for the id property. */
    const { id = '' } = query;
    /* Getting the session from the request. */
    const session: any = await getSession({ req });

    /* If the user is not logged in, it redirects to the login page. */
    if (!session) {
        return {
            redirect: {
                destination: `/auth/login?p=/orders/${id}`,
                permanent: false,
            }
        }
    }

    /* Getting the order from the database. */
    const order = await dbOrders.getOrderById(id.toString());

    /* If the order is not found, it redirects to the order history page. */
    if (!order) {
        return {
            redirect: {
                destination: '/orders/history',
                permanent: false,
            }
        }
    }

    /* Checking if the user is the owner of the order. */
    if (order.user !== session.user._id) {
        return {
            redirect: {
                destination: '/orders/history',
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