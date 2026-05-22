import { type User } from '@/entities/user'
import { actionUser, useUserStore } from '@/entities/user'
import { UploadDocsModal } from '@/features/upload-docs'
import { changePassword, getMe } from '@/shared/api'
import { mapUser, unwrapApi } from '@/shared/lib'
import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import { CopyInput } from '@/shared/ui/CopyInput/CopyInput'
import { InputField } from '@/shared/ui/InputField/InputField'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'antd'
import message from 'antd/es/message'
import Paragraph from 'antd/es/typography/Paragraph'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import { useState, type FC } from 'react'
import { useForm } from 'react-hook-form'
import { useShallow } from 'zustand/shallow'
import { newPasswordSchema, type newPasswordSchemaType } from '../../lib/validations'
import styles from './ProfileContent.module.css'

interface IProfileContent {
  user: User
}

export const ProfileContent: FC<IProfileContent> = ({ user }) => {
  const { setUser } = useUserStore(useShallow(actionUser))
  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    reset,
    formState: { isDirty, isValid, isSubmitting },
  } = useForm<newPasswordSchemaType>({
    defaultValues: {
      oldPassword: '',
      password: '',
      passwordRepeat: '',
    },
    resolver: zodResolver(newPasswordSchema),
    mode: 'onBlur',
  })
  const [open, setOpen] = useState<boolean>(false)

  const reloadMe = async () => {
    const currentUser = await unwrapApi(getMe())
    setUser(mapUser(currentUser))
  }

  const onSubmit = async (values: newPasswordSchemaType) => {
    try {
      const currentUser = await unwrapApi(
        changePassword({
          body: values,
        }),
      )

      setUser(mapUser(currentUser))
      reset()
      message.success('Пароль изменён')
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Не удалось изменить пароль')
    }
  }

  const onChangePassword = () => {
    if (getValues('oldPassword') && getValues('password')) {
      trigger(['password', 'oldPassword'])
    }
  }

  return (
    <div className={styles.content}>
      <div className={styles.wrapper}>
        <div className={styles.settings}>
          <Title className={styles.title}>Профиль</Title>
          <div className={styles.item}>
            <Text className={styles.itemText}>Ваша почта:</Text>
            <CopyInput value={user.email} className={styles.input} size='middle' />
          </div>

          <div className={styles.item}>
            <Text className={styles.itemText}>Имя пользователя:</Text>
            <CopyInput value={`@${user.username}`} className={styles.input} size='middle' />
          </div>

          <div className={styles.item}>
            <Text className={styles.itemText}>Ваш старый пароль:</Text>

            <InputField
              control={control}
              name='oldPassword'
              placeholder='••••••••'
              isSuccessVisible
              type='password'
              size='middle'
              onChange={onChangePassword}
            />
          </div>

          <div className={styles.item}>
            <Text className={styles.itemText}>Ваш новый пароль:</Text>

            <InputField
              control={control}
              name='password'
              isSuccessVisible
              type='password'
              size='middle'
              placeholder='••••••••'
              onChange={onChangePassword}
            />
          </div>

          <div className={styles.item}>
            <Text className={styles.itemText}>Повторите пароль:</Text>

            <InputField
              control={control}
              name='passwordRepeat'
              isSuccessVisible
              type='password'
              size='middle'
              placeholder='••••••••'
            />
          </div>

          <div className={styles.buttons}>
            <Button className={styles.resetButton} variant='link' type='link' onClick={() => reset()}>
              Очистить поля
            </Button>

            <ButtonField
              className={styles.button}
              size='middle'
              isPrimary
              variant='solid'
              type='primary'
              onClick={handleSubmit(onSubmit)}
              disabled={!isDirty || !isValid}
              loading={isSubmitting}
            >
              Изменить пароль
            </ButtonField>
          </div>
        </div>

        <div className={styles.sendDocs}>
          <Title className={styles.title}>Подтверждение профиля</Title>

          <Text>
            Загрузите документ, удостоверяющий личность, чтобы получить доступ к размещению объявлений. После успешной
            проверки ваш профиль будет отмечен как подтверждённый, что повысит доверие со стороны других пользователей.
          </Text>

          {user.verified === 'none' && (
            <ButtonField
              onClick={() => setOpen(true)}
              type='primary'
              variant='filled'
              size='medium'
              className={styles.uploadButton}
            >
              Загрузить файлы
            </ButtonField>
          )}

          {user.verified === 'pending' && (
            <Paragraph className={clsx(styles.statusText, styles.uploadPendingText)}>
              Ваши документы пока на проверке
            </Paragraph>
          )}

          {user.verified === 'verified' && (
            <Paragraph className={clsx(styles.statusText, styles.uploadVerifiedText)}>
              Вы успешно подтвердили свой профиль
            </Paragraph>
          )}

          <UploadDocsModal open={open} onClose={() => setOpen(false)} onUploaded={reloadMe} />
        </div>
      </div>
    </div>
  )
}
