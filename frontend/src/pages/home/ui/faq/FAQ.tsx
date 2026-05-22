import { Collapse } from 'antd'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import pageStyles from '../HomePage.module.css'
import styles from './FAQ.module.css'

const faqItems = [
  {
    key: '1',
    question: 'Как происходит бронирование жилья?',
    answer:
      'Чтобы забронировать жильё, выберите понравившийся объект, укажите желаемые даты и количество гостей, затем подтвердите бронь. После этого жильё закрепляется за вами, и вы получите подтверждение на почту и в личном кабинете.',
  },
  {
    key: '2',
    question: 'Можно ли отменить бронь и вернуть деньги?',
    answer:
      'Да, вы можете отменить бронь до начала периода аренды. Полная или частичная сумма возвращается в зависимости от политики конкретного объявления. Все детали возврата отображаются при бронировании.',
  },
  {
    key: '3',
    question: 'Как работает умная подборка жилья?',
    answer:
      'Вы описываете свои пожелания в свободной форме, указывая город, бюджет, количество гостей и дополнительные пожелания. Система анализирует текст и подбирает наиболее подходящие варианты жилья.',
  },
  {
    key: '4',
    question: 'Безопасно ли пользоваться сервисом?',
    answer:
      'Все пользователи проходят проверку, а система защищена от основных видов атак. Ваши данные и платежные реквизиты хранятся безопасно и не передаются третьим лицам.',
  },
  {
    key: '5',
    question: 'Можно ли сдавать своё жильё?',
    answer:
      'После подтверждения профиля вы сможете размещать свои объявления, управлять бронями, устанавливать цены и просматривать отзывы арендаторов.',
  },
]

export const FAQ = () => {
  return (
    <section className={clsx(pageStyles.section, styles.section)}>
      <div className={clsx('container', pageStyles.content)}>
        <Title level={2} className={pageStyles.title}>
          Часто задаваемые вопросы
        </Title>

        <Text className={clsx(pageStyles.text, styles.text)}>
          Ответы на самые популярные вопросы о бронировании, безопасности и работе сервиса.
        </Text>

        <Collapse
          accordion
          bordered={false}
          className={styles.faqCollapse}
          defaultActiveKey={[1]}
          items={faqItems.map(({ key, question, answer }) => ({
            key,
            label: <div className={styles.faqHeader}>{question}</div>,
            children: (
              <div className={styles.faqContent}>
                <p>{answer}</p>
              </div>
            ),
          }))}
        />
      </div>
    </section>
  )
}
