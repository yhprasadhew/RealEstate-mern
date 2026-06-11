import React from 'react'
import { adminLayoutStyles as s } from '../../assets/dummyStyles'
import AdminSidebar from '../AdminSidebar'
import { useState } from 'react'


const AdminLayout = () => {

    const[isSidebarOpen , setIsSidebarOpen]= useState(false);

  return (
    <div className ={s.layout}>

    <AdminSidebar 
    isOpen = {isSidebarOpen}
    onClose ={() => setIsSidebarOpen(false)}
/>

<div className ={s.mainWrapper}>
    
</div>
    </div>
  )
}

export default AdminLayout