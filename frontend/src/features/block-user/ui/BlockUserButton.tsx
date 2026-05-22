import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import { StopOutlined } from '@ant-design/icons'
import type { ButtonProps } from 'antd'
import Input from 'antd/es/input'
import message from 'antd/es/message'
import Modal from 'antd/es/modal'
import { useState } from 'react'

interface BlockUserButtonProps extends ButtonProps {
  userId: string
  onBlock: (userId: string, reason: string) => void
}

export const BlockUserButton = ({ userId, onBlock, disabled, ...props }: BlockUserButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState('')

  const normalizedReason = reason.trim()

  const handleClose = () => {
    setIsOpen(false)
    setReason('')
  }

  const handleBlock = () => {
    if (!normalizedReason) {
      message.warning('Укажите причину блокировки')
      return
    }

    onBlock(userId, normalizedReason)
    message.success('Пользователь заблокирован')
    handleClose()
  }

  return (
    <>
      <ButtonField {...props} danger disabled={disabled} icon={<StopOutlined />} onClick={() => setIsOpen(true)}>
        Заблокировать
      </ButtonField>

      <Modal
        title='Заблокировать пользователя'
        open={isOpen}
        onCancel={handleClose}
        maskClosable
        footer={[
          <ButtonField key='cancel' onClick={handleClose}>
            Закрыть
          </ButtonField>,
          <ButtonField key='block' danger type='primary' disabled={!normalizedReason} onClick={handleBlock}>
            Заблокировать
          </ButtonField>,
        ]}
      >
        <Input.TextArea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder='Например: нарушение правил сервиса или подозрительная активность'
          rows={4}
          maxLength={240}
          showCount
        />
      </Modal>
    </>
  )
}
