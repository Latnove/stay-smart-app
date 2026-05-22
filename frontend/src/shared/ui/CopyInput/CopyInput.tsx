import { CopyOutlined } from '@ant-design/icons'
import { Input, message, type InputProps } from 'antd'
import clsx from 'clsx'
import type { FC } from 'react'
import styles from './CopyInput.module.css'

interface ICopyInput extends InputProps {
  value: string | number
  className?: string
}

export const CopyInput: FC<ICopyInput> = ({ value, className, ...props }) => {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value.toString())
    message.success('Скопировано')
  }

  return (
    <Input
      className={clsx(styles.input, className)}
      {...props}
      value={value}
      readOnly
      suffix={<CopyOutlined className={styles.copyIcon} onClick={handleCopy} style={{ cursor: 'pointer' }} />}
    />
  )
}
