import PeopleSvg from '@/shared/assets/people-svgrepo-com.svg?react'
import { declension } from '@/shared/lib'
import { StarWithFill } from '@/shared/ui/StarWithFill/StarWithFill'
import { Tag } from '@/shared/ui/Tag/Tag'
import { EnvironmentOutlined } from '@ant-design/icons'
import Paragraph from 'antd/es/typography/Paragraph'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import type { FC, ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { ListingCategoriesRecord, type Listing } from '../../model/types'
import styles from './ListingCard.module.css'

interface IListingCard {
  listing: Listing
  className?: string
  children?: ReactNode
}

export const ListingCard: FC<IListingCard> = ({ className, listing, children }) => {
  return (
    <NavLink to={`/listings/${listing.id}`}>
      <div className={clsx(styles.card, className)}>
        {children && <div className={styles.featuresList}>{children}</div>}
        <div className={styles.image}>
          <img src={listing.images[0]} alt={listing.title} />
        </div>
        <div className={styles.content}>
          <div className={styles.tags}>
            <Tag className={styles.type}>{ListingCategoriesRecord[listing.type].text}</Tag>

            <Tag className={styles.city}>{listing.city}</Tag>

            <Tag className={styles.rating}>
              {listing.rating.toFixed(2)}

              <StarWithFill fillPercent={listing.rating / 5} size={14} />
            </Tag>
          </div>

          <Title level={3} className={styles.title} ellipsis={{ rows: 1, expandable: false, tooltip: true }}>
            {listing.title}
          </Title>

          <Paragraph className={styles.description} ellipsis={{ rows: 2, expandable: false, tooltip: true }}>
            {listing.description}
          </Paragraph>

          <Text className={styles.guestsWrapper}>
            <PeopleSvg className={styles.svg} />
            {listing.maxGuests} {declension(listing.maxGuests, 'гость', 'гостя', 'гостей')}
          </Text>

          <div className={styles.bottom}>
            <Text className={styles.address}>
              <EnvironmentOutlined className={styles.svg} />
              {listing.address}
            </Text>

            <Tag className={styles.price}>
              Цена: <strong>{listing.price} руб.</strong>
            </Tag>
          </div>
        </div>
      </div>
    </NavLink>
  )
}
