import { AiRecommendField } from '@/features/ai-recommend'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import pageStyles from '../HomePage.module.css'
import styles from './AiRecommendation.module.css'

export const AiRecommendation = () => {
  return (
    <section id='ai-recommendation' className={clsx(pageStyles.section, styles.section)}>
      <div className={clsx('container', styles.container)}>
        <div className={styles.content}>
          <Title level={2} className={clsx(pageStyles.title, styles.title)}>
            Умная подборка жилья
          </Title>
          <Text className={clsx(pageStyles.text, styles.text)}>
            Просто опишите, какое жильё вам нужно — без фильтров и сложных настроек. Система сама поймёт ваш запрос и
            подберёт лучшие варианты.
          </Text>
          <Text className={clsx(pageStyles.text, styles.text, styles.textSecondary)}>
            Укажите город, бюджет, количество гостей или просто напишите свободно — как человеку, максимально понятную
            речь.
          </Text>

          <div className={styles.list}>
            <div className={styles.item}>Квартира в центре Москвы до 10к рублей</div>
            <div className={styles.item}>Дом у моря для 4 человек</div>
            <div className={styles.item}>Современная квартира с крутым интерьером</div>
          </div>
        </div>

        <AiRecommendField className={styles.aiFeature} />
      </div>
    </section>
  )
}
