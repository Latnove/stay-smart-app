import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import { CloseCircleOutlined } from '@ant-design/icons'
import type { ButtonProps } from 'antd'
import Input from 'antd/es/input'
import message from 'antd/es/message'
import Modal from 'antd/es/modal'
import { useState } from 'react'

interface RejectUserVerificationButtonProps extends ButtonProps {
  userId: string
  onReject: (userId: string, reason: string) => void
}

export const RejectUserVerificationButton = ({ userId, onReject, ...props }: RejectUserVerificationButtonProps) => {
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

    onReject(userId, normalizedReason)
    message.success('Верификация отклонена')
    handleClose()
  }

  return (
    <>
      <ButtonField {...props} danger icon={<CloseCircleOutlined />} onClick={() => setIsOpen(true)}>
        Отказать
      </ButtonField>

      <Modal
        title='Отказать в верификации'
        open={isOpen}
        onCancel={handleClose}
        mask
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
          placeholder='Например: фото документа нечитаемое или данные не совпадают'
          rows={4}
          maxLength={240}
          showCount
        />
      </Modal>
    </>
  )
}
