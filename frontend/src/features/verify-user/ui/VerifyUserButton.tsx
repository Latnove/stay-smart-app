import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import { CheckCircleOutlined } from '@ant-design/icons'
import type { ButtonProps } from 'antd'
import message from 'antd/es/message'
import Modal from 'antd/es/modal'

interface VerifyUserButtonProps extends ButtonProps {
  userId: string
  onVerify: (userId: string) => void
}

export const VerifyUserButton = ({ userId, onVerify, ...props }: VerifyUserButtonProps) => {
  const handleClick = () => {
    Modal.confirm({
      title: 'Подтверждение пользователя',
      content: 'Документы проверены, подтвердить профиль пользователя?',
      okText: 'Подтвердить',
      cancelText: 'Закрыть',
      maskClosable: true,
      onOk() {
        onVerify(userId)
        message.success('Пользователь подтвержден')
      },
    })
  }

  return (
    <ButtonField {...props} type='primary' isPrimary icon={<CheckCircleOutlined />} onClick={handleClick}>
      Верифицировать
    </ButtonField>
  )
}
