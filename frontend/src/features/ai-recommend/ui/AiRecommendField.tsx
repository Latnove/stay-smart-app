import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import TextArea from 'antd/es/input/TextArea'
import Text from 'antd/es/typography/Text'
import clsx from 'clsx'
import { useState, type FC } from 'react'
import styles from './AiRecommendField.module.css'

interface IAiRecommendField {
  className?: string
}

export const AiRecommendField: FC<IAiRecommendField> = ({ className }) => {
  const [value, setValue] = useState<string | null>(null)

  return (
    <div className={clsx(styles.field, className)}>
      <TextArea
        className={styles.textarea}
        placeholder='Например: Квартира в центре Москвы до 10к рублей, для одного человека с неплохим интерьером'
        value={value ?? ''}
        showCount
        allowClear
        maxLength={255}
        style={{ resize: 'none' }}
        onChange={(e) => setValue(e.target.value)}
      />

      <div className={styles.bottom}>
        <Text className={styles.text}>AI-подбор на основе описания</Text>
        <ButtonField className={styles.button} isPrimary>
          Подобрать жилье
        </ButtonField>
      </div>
    </div>
  )
}
