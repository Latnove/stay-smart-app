import { actionFavorites, useFavoritesStore } from '@/entities/favorite'
import { actionUser, useUserStore } from '@/entities/user'
import { login } from '@/shared/api'
import { mapUser, unwrapApi } from '@/shared/lib'
import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import { CaptchaField } from '@/shared/ui/CaptchaField/CaptchaField'
import { InputField } from '@/shared/ui/InputField/InputField'
import { zodResolver } from '@hookform/resolvers/zod'
import message from 'antd/es/message'
import Text from 'antd/es/typography/Text'
import { useForm } from 'react-hook-form'
import { useShallow } from 'zustand/shallow'
import { loginSchema, type LoginType } from '../../lib/validation'
import styles from '../AuthPage.module.css'

export const LoginForm = () => {
  const { setAuth } = useUserStore(useShallow(actionUser))
  const { syncFavoritesAfterLogin } = useFavoritesStore(useShallow(actionFavorites))
  const {
    control,
    setError,
    clearErrors,
    handleSubmit,
    formState: { isValid, isDirty, isSubmitting },
  } = useForm<LoginType>({
    defaultValues: {
      email: '',
      password: '',
      captcha: '',
    },
    mode: 'onBlur',
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginType) => {
    try {
      const response = await unwrapApi(
        login({
          body: values,
        }),
      )

      if (!response.user || !response.accessToken) {
        throw new Error('Сервер не вернул данные авторизации')
      }

      setAuth(mapUser(response.user), response.accessToken)
      await syncFavoritesAfterLogin()
      message.success('Вы вошли в аккаунт')
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Не удалось войти')
    }
  }

  return (
    <form className={styles.form}>
      <div className={styles.label}>
        <Text className={styles.text}>Почта или имя пользователя:</Text>
        <InputField
          control={control}
          isSuccessVisible={true}
          type='text'
          name='email'
          className={styles.inputField}
          size='medium'
          placeholder='test@gmail.com или admin'
          autoComplete='username'
        />
      </div>

      <div className={styles.label}>
        <Text className={styles.text}>Ваш пароль:</Text>
        <InputField
          control={control}
          isSuccessVisible={true}
          type='password'
          name='password'
          className={styles.inputField}
          size='medium'
          placeholder='••••••••'
          autoComplete='current-password'
        />
      </div>

      <CaptchaField
        control={control}
        name='captcha'
        options={{ size: 'flexible', theme: 'light' }}
        setError={setError}
        clearErrors={clearErrors}
        className={styles.captchaWrapper}
      />

      <ButtonField
        variant='solid'
        type='primary'
        className={styles.button}
        size='large'
        isPrimary
        disabled={!isValid || !isDirty}
        loading={isSubmitting}
        onClick={handleSubmit(onSubmit)}
      >
        Войти
      </ButtonField>
    </form>
  )
}
