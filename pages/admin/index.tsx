import React, { useEffect, useState } from 'react'
import useSWR from 'swr';
import { DashboardSummaryResponse } from '../../interfaces';

import { AccessTimeOutlined , AttachMoney, CancelPresentationOutlined, CategoryOutlined, CreditCardOffOutlined, CreditCardOutlined, DashboardOutlined, GroupsOutlined, ProductionQuantityLimitsOutlined } from '@mui/icons-material'
import { Grid, Typography } from '@mui/material'

import { AdminLayout } from '../../components/layouts'
import { SummaryTile } from '../../components/admin/SummaryTile';
import { FullScreenLoading } from '../../components/ui';

export const DashboardPage = () => {

    const {data,error} = useSWR<DashboardSummaryResponse>('api/admin/dashboard', {
        refreshInterval: 30 * 1000
    });

    const [refreshIn, setRefreshIn] = useState(30);

    useEffect(() => {
        const interval = setInterval(() => {
            setRefreshIn(refreshIn=> refreshIn > 0 ? refreshIn - 1 : 30);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    if(!error && !data){
        return (
            <FullScreenLoading/>
        )
    }

    if(error){
        console.log(error);
        return <Typography>Error al cargar la información</Typography>
    }

    const { 
        numberOfOrders,
        paidOrders,
        notPaidOrders,
        numberOfClients,
        numberOfProducts,
        productsWithNoInventory,
        lowInventory,
    } = data!;
    

    return (
        <AdminLayout
            title={'Dashboard'}
            subTitle={'Estadisticas generales'}
            icon={<DashboardOutlined />}>
            <Grid container spacing={2}>

                <SummaryTile
                    title={numberOfOrders}
                    subtitle={'Pedidos Totales'}
                    icon={<CreditCardOutlined color='secondary' sx={{ fontSize: 40 }} />}
                />

                <SummaryTile
                    title={paidOrders}
                    subtitle={'Pedidos Pagados'}
                    icon={<AttachMoney color='success' sx={{ fontSize: 40 }} />}
                />

                <SummaryTile
                    title={notPaidOrders}
                    subtitle={'Pedidos Pendientes'}
                    icon={<CreditCardOffOutlined color='error' sx={{ fontSize: 40 }} />}
                />
                <SummaryTile
                    title={numberOfClients}
                    subtitle={'Clientes'}
                    icon={<GroupsOutlined color='primary' sx={{ fontSize: 40 }} />}
                />
                <SummaryTile
                    title={numberOfProducts}
                    subtitle={'Productos'}
                    icon={<CategoryOutlined color='warning' sx={{ fontSize: 40 }} />}
                />
                <SummaryTile
                    title={productsWithNoInventory}
                    subtitle={'Sin Stock'}
                    icon={<CancelPresentationOutlined color='error' sx={{ fontSize: 40 }} />}
                />
                <SummaryTile
                    title={lowInventory}
                    subtitle={'Bajo Stock'}
                    icon={<ProductionQuantityLimitsOutlined color='warning' sx={{ fontSize: 40 }} />}
                />
                <SummaryTile
                    title={refreshIn}
                    subtitle={'Actualización en:'}
                    icon={<AccessTimeOutlined color='secondary' sx={{ fontSize: 40 }} />}
                />

            </Grid>
        </AdminLayout>
    )
}

export default DashboardPage