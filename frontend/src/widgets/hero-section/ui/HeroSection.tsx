import { Tag } from 'antd'
import clsx from 'clsx'
import type { FC, ReactNode } from 'react'
import styles from './HeroSection.module.css'

interface IHeroSection {
  tag: string
  title: string
  text: string
  className?: string
  children?: ReactNode
}

export const HeroSection: FC<IHeroSection> = ({ className, tag, text, title, children }) => {
  return (
    <section className={clsx(styles.hero, className)}>
      <div className={'container'}>
        <div className={styles.cta}>
          <div className={clsx(children && styles.content)}>
            <Tag className={styles.badge}>{tag}</Tag>

            <h1 className={styles.title}>{title}</h1>

            <p className={styles.subtitle}>{text}</p>
          </div>

          {children}
        </div>
      </div>
    </section>
  )
}
