import { HomeOutlined, LockOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import styles from './ForbiddenPage.module.css'

export const ForbiddenPage = () => {
  return (
    <section className={styles.section}>
      <div className={clsx('container', styles.container)}>
        <div className={styles.content}>
          <Text className={styles.code}>
            <LockOutlined />
            403
          </Text>

          <Title className={styles.title} level={1}>
            Доступ запрещен
          </Title>

          <Text className={styles.subtitle}>
            У вас нет прав для просмотра этой страницы. Войдите под аккаунтом с нужной ролью или вернитесь на главную.
          </Text>

          <Link className={styles.link} to='/'>
            <Button className={styles.button} type='primary' size='large' icon={<HomeOutlined />}>
              На главную
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
