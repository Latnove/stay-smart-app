import { Button, type ButtonProps } from 'antd'
import clsx from 'clsx'
import type { FC, ReactNode } from 'react'
import styles from './ButtonField.module.css'

interface IButtonField extends ButtonProps {
  children?: ReactNode
  isPrimary?: boolean
  isSecondary?: boolean
}

export const ButtonField: FC<IButtonField> = ({ children, className, isPrimary, isSecondary, ...props }) => {
  return (
    <Button
      {...props}
      className={clsx(className, styles.button, isSecondary && styles.isSecondary, isPrimary && styles.isPrimary)}
    >
      {children}
    </Button>
  )
}
