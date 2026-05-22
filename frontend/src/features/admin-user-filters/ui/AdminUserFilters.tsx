import Input from 'antd/es/input'
import Select from 'antd/es/select'
import { SearchOutlined } from '@ant-design/icons'
import { useShallow } from 'zustand/shallow'
import {
  actionAdminUserFilters,
  selectAdminUserFilters,
  useAdminUserFiltersStore,
} from '../model/useAdminUserFiltersStore'
import styles from './AdminUserFilters.module.css'

export const AdminUserFilters = () => {
  const { search, verificationFilter, sortOrder } = useAdminUserFiltersStore(useShallow(selectAdminUserFilters))
  const { setSearch, setSortOrder, setVerificationFilter } = useAdminUserFiltersStore(
    useShallow(actionAdminUserFilters),
  )

  return (
    <div className={styles.filters}>
      <Input
        className={styles.search}
        prefix={<SearchOutlined />}
        placeholder='Поиск по email или username'
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <Select
        className={styles.filterSelect}
        value={verificationFilter}
        onChange={setVerificationFilter}
        options={[
          { value: 'all', label: 'Все статусы' },
          { value: 'blocked', label: 'Заблокированные' },
          { value: 'pending', label: 'На проверке' },
          { value: 'verified', label: 'Подтвержденные' },
          { value: 'rejected', label: 'Отклоненные' },
          { value: 'none', label: 'Без проверки' },
        ]}
      />

      <Select
        className={styles.filterSelect}
        value={sortOrder}
        onChange={setSortOrder}
        options={[
          { value: 'newest', label: 'Сначала новые' },
          { value: 'oldest', label: 'Сначала старые' },
        ]}
      />
    </div>
  )
}
