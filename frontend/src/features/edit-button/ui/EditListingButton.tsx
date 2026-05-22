import clsx from 'clsx'

import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import { EditOutlined } from '@ant-design/icons'
import type { ButtonProps } from 'antd'
import { Modal } from 'antd'
import { useState } from 'react'

import { ListingForm } from '@/features/listing-form'
import styles from './EditListingButton.module.css'

interface EditListingButtonProps extends ButtonProps {
  listingId: string
}

export const EditListingButton = ({ listingId, className, ...props }: EditListingButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <ButtonField
        {...props}
        icon={<EditOutlined />}
        className={clsx(styles.editButton, className)}
        onClick={() => setIsOpen(true)}
      >
        Редактировать
      </ButtonField>

      <Modal
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}
        width={700}
        centered
        destroyOnHidden
        className={styles.modal}
      >
        <ListingForm mode='edit' listingId={listingId} onClose={() => setIsOpen(false)} />
      </Modal>
    </>
  )
}
