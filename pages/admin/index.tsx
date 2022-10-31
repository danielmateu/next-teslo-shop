import { AccessTimeOutlined, AttachmentOutlined, AttachMoney, CancelPresentationOutlined, CategoryOutlined, CreditCard, CreditCardOffOutlined, CreditCardOutlined, DashboardOutlined, GroupAddOutlined, GroupsOutlined, ProductionQuantityLimitsOutlined } from '@mui/icons-material'
import { Card, CardContent, Grid, Typography } from '@mui/material'
import React from 'react'
import { AdminLayout } from '../../components/layouts'
import { SummaryTile } from '../../components/admin/SummaryTile';

const DashboardPage = () => {
    return (
        <AdminLayout
            title={'Dashboard'}
            subTitle={'Estadisticas generales'}
            icon={<DashboardOutlined />}>
            <Grid container spacing={2}>



                <SummaryTile
                    title={'1'}
                    subtitle={'Pedidos Totales'}
                    icon={<CreditCardOutlined color='secondary' sx={{ fontSize: 40 }} />}
                />

                <SummaryTile
                    title={'2'}
                    subtitle={'Pedidos Pagados'}
                    icon={<AttachMoney color='success' sx={{ fontSize: 40 }} />}
                />

                <SummaryTile
                    title={'3'}
                    subtitle={'Pedidos Pendientes'}
                    icon={<CreditCardOffOutlined color='error' sx={{ fontSize: 40 }} />}
                />
                <SummaryTile
                    title={'4'}
                    subtitle={'Clientes'}
                    icon={<GroupsOutlined color='primary' sx={{ fontSize: 40 }} />}
                />
                <SummaryTile
                    title={'5'}
                    subtitle={'Productos'}
                    icon={<CategoryOutlined color='warning' sx={{ fontSize: 40 }} />}
                />
                <SummaryTile
                    title={'6'}
                    subtitle={'Sin Stock'}
                    icon={<CancelPresentationOutlined color='error' sx={{ fontSize: 40 }} />}
                />
                <SummaryTile
                    title={'7'}
                    subtitle={'Bajo Stock'}
                    icon={<ProductionQuantityLimitsOutlined color='warning' sx={{ fontSize: 40 }} />}
                />
                <SummaryTile
                    title={'8'}
                    subtitle={'Actualización en:'}
                    icon={<AccessTimeOutlined color='secondary' sx={{ fontSize: 40 }} />}
                />

            </Grid>
        </AdminLayout>
    )
}

export default DashboardPage