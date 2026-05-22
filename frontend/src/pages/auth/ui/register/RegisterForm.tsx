import { register } from '@/shared/api'
import { unwrapApi } from '@/shared/lib'
import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import { CaptchaField } from '@/shared/ui/CaptchaField/CaptchaField'
import { InputField } from '@/shared/ui/InputField/InputField'
import { zodResolver } from '@hookform/resolvers/zod'
import message from 'antd/es/message'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { registerSchema, type RegisterType } from '../../lib/validation'
import styles from '../AuthPage.module.css'

export const RegisterForm = () => {
  const [registeredEmail, setRegisteredEmail] = useState('')
  const {
    control,
    setError,
    clearErrors,
    handleSubmit,
    formState: { isValid, isDirty, isSubmitting },
  } = useForm<RegisterType>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      repeatPassword: '',
      captcha: '',
    },
    mode: 'onBlur',
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (values: RegisterType) => {
    try {
      await unwrapApi(
        register({
          body: values,
        }),
      )

      setRegisteredEmail(values.email)
      message.success('Письмо подтверждения отправлено')
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Не удалось зарегистрироваться')
    }
  }

  if (registeredEmail) {
    return (
      <div className={styles.form}>
        <Title className={styles.title} level={2}>
          Проверьте почту
        </Title>
        <Text className={styles.change}>
          Мы отправили ссылку подтверждения на {registeredEmail}. После перехода по ссылке аккаунт сразу авторизуется.
        </Text>
      </div>
    )
  }

  return (
    <form className={styles.form}>
      <div className={styles.label}>
        <Text className={styles.text}>Имя пользователя:</Text>
        <InputField
          isSuccessVisible={true}
          control={control}
          type='text'
          name='username'
          className={styles.inputField}
          size='medium'
          placeholder='steve228'
          autoComplete='username'
        />
      </div>

      <div className={styles.label}>
        <Text className={styles.text}>Ваша почта:</Text>
        <InputField
          control={control}
          isSuccessVisible={true}
          type='email'
          name='email'
          className={styles.inputField}
          size='medium'
          placeholder='test@gmail.com'
          autoComplete='email'
        />
      </div>

      <div className={styles.label}>
        <Text className={styles.text}>Придумайте пароль:</Text>
        <InputField
          control={control}
          isSuccessVisible={true}
          type='password'
          name='password'
          className={styles.inputField}
          size='medium'
          placeholder='••••••••'
          autoComplete='new-password'
        />
      </div>

      <div className={styles.label}>
        <Text className={styles.text}>Повторите пароль:</Text>
        <InputField
          control={control}
          isSuccessVisible={true}
          type='password'
          name='repeatPassword'
          className={styles.inputField}
          size='medium'
          placeholder='••••••••'
          autoComplete='new-password'
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
        Зарегистрироваться
      </ButtonField>
    </form>
  )
}
