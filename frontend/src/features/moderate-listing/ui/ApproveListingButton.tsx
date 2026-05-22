import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import { CheckOutlined } from '@ant-design/icons'
import type { ButtonProps } from 'antd'
import message from 'antd/es/message'
import Modal from 'antd/es/modal'

interface ApproveListingButtonProps extends ButtonProps {
  listingId: string
  onApprove: (listingId: string) => void
}

export const ApproveListingButton = ({ listingId, onApprove, ...props }: ApproveListingButtonProps) => {
  const handleClick = () => {
    Modal.confirm({
      title: 'Подтверждение объявления',
      content: 'После подтверждения объявление станет активным и появится в каталоге.',
      okText: 'Активировать',
      cancelText: 'Закрыть',
      maskClosable: true,
      onOk() {
        onApprove(listingId)
        message.success('Объявление активировано')
      },
    })
  }

  return (
    <ButtonField {...props} type='primary' isPrimary icon={<CheckOutlined />} onClick={handleClick}>
      Подтвердить
    </ButtonField>
  )
}
