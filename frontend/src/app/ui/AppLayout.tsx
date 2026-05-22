import { Layout } from 'antd'
import { Content } from 'antd/es/layout/layout'
import { Outlet } from 'react-router-dom'
import { NotificationsSidebar } from '@/features/notifications'
import styles from './AppLayout.module.css'
import { Footer } from './Footer/Footer'
import { Header } from './Header/Header'

export const AppLayout = () => {
  return (
    <Layout className={styles.layout}>
      <Header />
      <NotificationsSidebar />

      <Content className={styles.main}>
        <Outlet />
      </Content>

      <Footer />
    </Layout>
  )
}
