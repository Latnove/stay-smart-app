import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import { CloseOutlined } from '@ant-design/icons'
import type { ButtonProps } from 'antd'
import Input from 'antd/es/input'
import message from 'antd/es/message'
import Modal from 'antd/es/modal'
import { useState } from 'react'

interface RejectListingButtonProps extends ButtonProps {
  listingId: string
  onReject: (listingId: string, reason: string) => void
}

export const RejectListingButton = ({ listingId, onReject, ...props }: RejectListingButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState('')

  const normalizedReason = reason.trim()

  const handleClose = () => {
    setIsOpen(false)
    setReason('')
  }

  const handleReject = () => {
    if (!normalizedReason) {
      message.warning('Укажите причину отказа')
      return
    }

    onReject(listingId, normalizedReason)
    message.success('Объявление отправлено в черновик')
    handleClose()
  }

  return (
    <>
      <ButtonField {...props} danger icon={<CloseOutlined />} onClick={() => setIsOpen(true)}>
        Отказать
      </ButtonField>

      <Modal
        title='Отказать в публикации'
        open={isOpen}
        onCancel={handleClose}
        maskClosable
        footer={[
          <ButtonField key='cancel' onClick={handleClose}>
            Закрыть
          </ButtonField>,
          <ButtonField key='reject' danger type='primary' disabled={!normalizedReason} onClick={handleReject}>
            Отказать
          </ButtonField>,
        ]}
      >
        <Input.TextArea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder='Например: не хватает фотографий, неверный адрес или описание нарушает правила'
          rows={4}
          maxLength={240}
          showCount
        />
      </Modal>
    </>
  )
}
