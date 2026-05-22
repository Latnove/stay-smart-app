import { StarFilled } from '@ant-design/icons'
import styles from './StarWithFill.module.css'
import type { FC } from 'react'
import clsx from 'clsx'

interface IStarWithFill {
  fillPercent: number
  className?: string
  size?: number
}

export const StarWithFill: FC<IStarWithFill> = ({ fillPercent = 0, className, size = 18 }) => {
  return (
    <div className={clsx(className, styles.wrapper)}>
      <StarFilled style={{ fontSize: size }} className={styles.backFilled} />
      <StarFilled
        style={{
          fontSize: size,
          clipPath: `inset(0 ${100 - fillPercent * 100}% 0 0)`,
        }}
        className={styles.filled}
      />
    </div>
  )
}
