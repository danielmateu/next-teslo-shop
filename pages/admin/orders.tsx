import React from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { ConfirmationNumberOutlined } from '@mui/icons-material';

const OrdersPage = () => {
  return (
    <AdminLayout 
        title={'Pedidos'} 
        subTitle={'Mantenimiento de pedidos'}
        icon={<ConfirmationNumberOutlined/>}
    >

    </AdminLayout>
  )
}

export default OrdersPage