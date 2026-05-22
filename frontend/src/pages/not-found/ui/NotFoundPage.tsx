import { HomeOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import type { FC } from 'react'
import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

interface INotFoundPage {
  title?: string
  subtitle?: string
  actionText?: string
  to?: string
}

export const NotFoundPage: FC<INotFoundPage> = ({
  title = 'Страница не найдена',
  subtitle = 'Проверьте адрес или вернитесь к каталогу объявлений.',
  actionText = 'Вернуться к каталогу',
  to = '/',
}) => {
  return (
    <section className={styles.section}>
      <div className={clsx('container', styles.container)}>
        <div className={styles.content}>
          <Text className={styles.code}>404</Text>
          <Title className={styles.title} level={1}>
            {title}
          </Title>
          <Text className={styles.subtitle}>{subtitle}</Text>
          <Link className={styles.link} to={to}>
            <Button className={styles.button} type='primary' size='large' icon={<HomeOutlined />}>
              {actionText}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
