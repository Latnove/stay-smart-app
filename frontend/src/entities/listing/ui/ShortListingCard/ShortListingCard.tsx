import PeopleSvg from '@/shared/assets/people-svgrepo-com.svg?react'
import { declension } from '@/shared/lib'
import { Tag } from '@/shared/ui/Tag/Tag'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import type { FC, ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { ListingCategoriesRecord, type Listing } from '../../model/types'
import styles from './ShortListingCard.module.css'
import clsx from 'clsx'

interface IShortListingCard {
  listing: Listing
  children?: ReactNode
  className?: string
}

export const ShortListingCard: FC<IShortListingCard> = ({ listing, className, children }) => {
  return (
    <NavLink to={`/listings/${listing.id}`} className={styles.link}>
      <div className={clsx(styles.card, className)}>
        <div className={styles.image}>
          {children && <div className={styles.featuresList}>{children}</div>}

          <img src={listing.images[0]} alt={listing.title} />

          <Tag className={styles.type}>{ListingCategoriesRecord[listing.type].text}</Tag>
        </div>
        <div className={styles.content}>
          <Title level={3} className={styles.title}>
            {listing.title}
          </Title>
          <div className={styles.middle}>
            <Text className={styles.city}>{listing.city}</Text>
            <Text className={styles.guestsWrapper}>
              <PeopleSvg className={styles.svg} />
              {listing.maxGuests} {declension(listing.maxGuests, 'гость', 'гостя', 'гостей')}
            </Text>
          </div>

          <div className={styles.bottom}>
            <Text className={styles.price}>{listing.price} руб.</Text>

            <Text className={styles.rating}>{listing.rating.toFixed(2)}</Text>
          </div>
        </div>
      </div>
    </NavLink>
  )
}
