import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import { UnlockOutlined } from '@ant-design/icons'
import type { ButtonProps } from 'antd'
import message from 'antd/es/message'
import Modal from 'antd/es/modal'

interface UnblockUserButtonProps extends ButtonProps {
  userId: string
  onUnblock: (userId: string) => void
}

export const UnblockUserButton = ({ userId, onUnblock, ...props }: UnblockUserButtonProps) => {
  const handleClick = () => {
    Modal.confirm({
      title: 'Разблокировать пользователя',
      content: 'Пользователь снова сможет пользоваться закрытыми разделами сервиса.',
      okText: 'Разблокировать',
      cancelText: 'Закрыть',
      maskClosable: true,
      onOk() {
        onUnblock(userId)
        message.success('Пользователь разблокирован')
      },
    })
  }

  return (
    <ButtonField {...props} icon={<UnlockOutlined />} onClick={handleClick}>
      Разблокировать
    </ButtonField>
  )
}
