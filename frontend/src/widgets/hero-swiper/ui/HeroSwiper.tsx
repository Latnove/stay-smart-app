import clsx from 'clsx'
import type { FC, ReactNode } from 'react'
import 'swiper/css'
import { Swiper, SwiperSlide, type SwiperProps } from 'swiper/react'
import styles from './HeroSwiper.module.css'

interface IImage {
  src: string
  alt: string
}

interface IHeroSwiper extends SwiperProps {
  images: IImage[]
  children: ReactNode
  className?: string
}

export const HeroSwiper: FC<IHeroSwiper> = ({ images, children, className, ...props }) => {
  return (
    <div className={clsx(styles.hero, className)}>
      <div className={styles.swiper}>
        <Swiper {...props}>
          {images.map((el) => (
            <SwiperSlide className={styles.swiperSlide} key={el.src}>
              <img className={styles.image} src={el.src} alt={el.alt} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className={styles.content}>{children}</div>
    </div>
  )
}
