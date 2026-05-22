import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { Button, Select } from 'antd'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import { useMemo, type FC } from 'react'
import { useShallow } from 'zustand/shallow'
import { actionCardView, actionSort, selectCardView, selectSort, useListingsStore } from '../../model/useListingsStore'
import styles from './ListingSort.module.css'

interface IListingSort {
  className?: string
  total: number
}

export const ListingSort: FC<IListingSort> = ({ className, total }) => {
  const { sortBy, order } = useListingsStore(useShallow(selectSort))
  const { setSortBy } = useListingsStore(useShallow(actionSort))
  const { setIsShortCard } = useListingsStore(useShallow(actionCardView))
  const { isShortCard } = useListingsStore(useShallow(selectCardView))

  const defaultValue = useMemo(() => `${sortBy}-${order}`, [sortBy, order])

  return (
    <div className={clsx(styles.container, className)}>
      <Title level={2} className={styles.title}>
        Всего объявлений: <span className={styles.total}>{total} шт.</span>
      </Title>
      <div className={styles.sortWrapper}>
        <div className={styles.view}>
          <Button
            icon={<AppstoreOutlined />}
            className={clsx(styles.icon, isShortCard && styles.iconActive)}
            onClick={() => setIsShortCard(true)}
          />
          <Button
            icon={<UnorderedListOutlined />}
            className={clsx(styles.icon, !isShortCard && styles.iconActive)}
            onClick={() => setIsShortCard(false)}
          />
        </div>
        <Select
          className={styles.select}
          defaultValue={defaultValue}
          options={[
            { value: 'name-asc', label: 'Название (от А до Я)' },
            { value: 'name-desc', label: 'Название (от Я до А)' },
            { value: 'price-asc', label: 'Цена (по возрастанию)' },
            { value: 'price-desc', label: 'Цена (по убыванию)' },
            { value: 'rating-asc', label: 'Рейтинг (по возрастанию)' },
            { value: 'rating-desc', label: 'Рейтинг (по убыванию)' },
          ]}
          onChange={(val) => {
            const [sortBy, order] = val.split('-') as ['price' | 'name' | 'rating', 'asc' | 'desc']

            setSortBy({ sortBy, order })
          }}
        />
      </div>
    </div>
  )
}
