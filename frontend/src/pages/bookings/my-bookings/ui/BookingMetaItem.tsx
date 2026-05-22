import Text from 'antd/es/typography/Text'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import styles from './BookingMetaItem.module.css'

interface BookingMetaItemProps {
  icon: ReactNode
  label: string
  value: ReactNode
  accent?: boolean
}

export const BookingMetaItem = ({ icon, label, value, accent }: BookingMetaItemProps) => {
  return (
    <div className={styles.metaItem}>
      <span className={styles.metaIcon}>{icon}</span>
      <div className={styles.metaText}>
        <Text className={styles.metaLabel}>{label}</Text>
        <Text className={clsx(styles.metaValue, accent && styles.metaValueAccent)}>{value}</Text>
      </div>
    </div>
  )
}
