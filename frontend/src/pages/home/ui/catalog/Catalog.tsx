import { Listings } from '@/widgets/listings'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import styles from '../HomePage.module.css'

export const Catalog = () => {
  return (
    <section id='catalog' className={styles.section}>
      <div className={clsx('container', styles.content)}>
        <Title level={2} className={styles.title}>
          Подобрать формат проживания, который подходит именно вам
        </Title>
        <Text className={styles.text} style={{ marginBottom: '40px' }}>
          Найдите жильё, которое действительно соответствует вашим ожиданиям — от уютных студий для одного человека до
          просторных апартаментов для семьи или компании. Мы собрали проверенные варианты с реальными отзывами и
          прозрачными условиями, чтобы вы могли принимать решения без лишних сомнений.
        </Text>

        <Listings />
      </div>
    </section>
  )
}
