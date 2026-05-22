import type { Booking } from '@/entities/booking'
import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import { CloseCircleOutlined } from '@ant-design/icons'
import type { ButtonProps } from 'antd'
import message from 'antd/es/message'
import Modal from 'antd/es/modal'
import Tooltip from 'antd/es/tooltip'
import { isBefore, parseISO, startOfDay } from 'date-fns'

interface CancelBookingButtonProps extends ButtonProps {
  booking: Booking
  canManage?: boolean
  successText?: string
  onCancel: (bookingId: string) => void
}

export const CancelBookingButton = ({
  booking,
  canManage = true,
  successText = 'Бронь отменена',
  onCancel,
  ...props
}: CancelBookingButtonProps) => {
  const status =
    booking.status === 'active' && !isBefore(startOfDay(new Date()), startOfDay(parseISO(booking.startDate)))
      ? 'provided'
      : booking.status

  const disabledReason = !canManage
    ? 'Недостаточно прав для отмены'
    : status === 'cancelled'
      ? 'Эта бронь уже отменена'
      : status === 'provided'
        ? 'Аренда уже началась'
        : undefined

  const isDisabled = Boolean(disabledReason)

  const handleClick = () => {
    if (isDisabled) return

    Modal.confirm({
      title: 'Отмена бронирования',
      content: 'Вы действительно хотите отменить эту бронь?',
      okText: 'Отменить бронь',
      cancelText: 'Закрыть',
      maskClosable: true,
      okButtonProps: {
        danger: true,
      },
      onOk() {
        onCancel(booking.id)
        message.success(successText)
      },
    })
  }

  return (
    <Tooltip title={disabledReason}>
      <span>
        <ButtonField {...props} danger disabled={isDisabled} icon={<CloseCircleOutlined />} onClick={handleClick}>
          Отменить бронь
        </ButtonField>
      </span>
    </Tooltip>
  )
}
