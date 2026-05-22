import Text from 'antd/es/typography/Text'
import clsx from 'clsx'
import type { FC, ReactNode } from 'react'
import styles from './Tag.module.css'

interface ITag {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export const Tag: FC<ITag> = ({ children, className, onClick }) => {
  return (
    <Text className={clsx(styles.tag, className)} onClick={onClick}>
      {children}
    </Text>
  )
}
