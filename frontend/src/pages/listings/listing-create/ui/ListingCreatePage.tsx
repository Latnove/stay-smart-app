import { selectUser, useUserStore } from '@/entities/user'
import { ListingForm } from '@/features/listing-form'
import { ROUTES } from '@/shared/config'
import { HeroSection } from '@/widgets/hero-section'
import { Navigate } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import styles from './ListingCreatePage.module.css'

export const ListingCreatePage = () => {
  const { user } = useUserStore(useShallow(selectUser))

  if (user?.role === 'user' && user.verified !== 'verified') return <Navigate to={ROUTES.HOME.path} />

  return (
    <main className={styles.page}>
      <HeroSection
        tag='Новое объявление'
        title='Создайте объявление прямо сейчас'
        text='Добавьте жильё, фотографии, цену и описание. После заполнения объявление можно будет опубликовать.'
      />

      <section className={styles.formSection}>
        <div className='container'>
          <ListingForm mode='create' size='middle' />
        </div>
      </section>
    </main>
  )
}
