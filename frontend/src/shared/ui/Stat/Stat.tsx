import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import type { ComponentType, FC } from 'react'
import styles from './Stat.module.css'

interface IStat {
  Icon: ComponentType<{ className?: string }>
  value: number
  title: string
  className?: string
}

export const Stat: FC<IStat> = ({ className, Icon, value, title }) => {
  return (
    <div className={clsx(styles.stat, className)}>
      <Icon className={styles.icon} />

      <Text className={styles.value}>{value}</Text>

      <Title className={styles.title} level={4}>
        {title}
      </Title>
    </div>
  )
}
