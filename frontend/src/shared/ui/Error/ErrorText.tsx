import Text from 'antd/es/typography/Text'
import clsx from 'clsx'
import type { FC } from 'react'
import styles from './ErrorText.module.css'

interface IErrorText {
  error?: { message?: string }
  className?: string
}

export const ErrorText: FC<IErrorText> = ({ error, className }) => {
  return <>{error && <Text className={clsx(className, styles.error)}>{error.message}</Text>}</>
}
