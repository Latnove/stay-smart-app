import { actionFavorites, useFavoritesStore } from '@/entities/favorite'
import type { Listing } from '@/entities/listing'
import { isUUID } from '@/shared/lib'
import { HeartFilled, HeartOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import { type FC } from 'react'
import { useShallow } from 'zustand/shallow'
import styles from './FavoriteButton.module.css'

interface IFavoriteButton {
  listing: Listing
  className?: string
}

export const FavoriteButton: FC<IFavoriteButton> = ({ listing, className }) => {
  const { toggleFavorite } = useFavoritesStore(useShallow(actionFavorites))

  const isActive = useFavoritesStore((state) => state.favorites.includes(listing.id))

  return (
    <button
      type='button'
      className={clsx(className, styles.button, isActive && styles.active)}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!isUUID(listing.id)) {
          console.error('Invalid UUID', listing.id)
          return
        }
        toggleFavorite(listing)
      }}
    >
      {isActive ? <HeartFilled className={styles.icon} /> : <HeartOutlined className={styles.icon} />}
    </button>
  )
}
