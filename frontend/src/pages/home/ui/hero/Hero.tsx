import imgSrc1 from '@/shared/assets/photo-1493809842364-78817add7ffb.jpeg'
import imgSrc2 from '@/shared/assets/photo-1502672260266-1c1ef2d93688.jpeg'
import imgSrc3 from '@/shared/assets/photo-1522708323590-d24dbb6b0267.jpeg'
import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import { HeroSwiper } from '@/widgets/hero-swiper'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import { Autoplay } from 'swiper/modules'
import styles from './Hero.module.css'

const images = [
  {
    src: imgSrc1,
    alt: 'Современная квартира',
  },
  {
    src: imgSrc2,
    alt: 'Уютная студия рядом с парком',
  },
  {
    src: imgSrc3,
    alt: 'Апартаменты с террасой',
  },
]

const scrollToBlock = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export const Hero = () => {
  return (
    <section className={styles.hero}>
      <HeroSwiper
        className={styles.swiper}
        modules={[Autoplay]}
        images={images}
        speed={1000}
        loop
        autoplay={{ delay: 5000 }}
      >
        <div className={clsx('container', styles.content)}>
          <Title level={1} className={styles.title}>
            Найди жильё, которое подходит именно тебе вместе с нами
          </Title>
          <Text className={styles.text}>
            Умный подбор, проверенные пользователи лично нами и честные отзывы. Мы экономим твое время и показываем
            лучшее из всех возможных.
          </Text>

          <div className={styles.buttons}>
            <ButtonField isPrimary size='large' onClick={() => scrollToBlock('catalog')}>
              Начать поиск
            </ButtonField>

            <ButtonField size='large' variant='dashed' isSecondary onClick={() => scrollToBlock('ai-recommendation')}>
              Попробовать AI
            </ButtonField>
          </div>
        </div>
      </HeroSwiper>
    </section>
  )
}
