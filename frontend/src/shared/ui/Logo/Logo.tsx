import LogoSvg from '@/shared/assets/logo.svg?react'
import clsx from 'clsx'
import type { FC } from 'react'
import styles from './Logo.module.css'

interface ILogo {
  className?: string
  onClick?: () => void
}

export const Logo: FC<ILogo> = ({ className, onClick }) => {
  return (
    <div className={clsx(styles.logo, className)} onClick={onClick}>
      <div className={styles.img}>
        <LogoSvg />
      </div>
      <span className={styles.text}>StaySmart</span>
    </div>
  )
}
