import { selectUser, useUserStore } from '@/entities/user'
import { ROUTES } from '@/shared/config'
import Link from 'antd/es/typography/Link'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import styles from './AuthPage.module.css'
import { LoginForm } from './login/LoginForm'
import { RegisterForm } from './register/RegisterForm'

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState<boolean>(false)

  const { user } = useUserStore(useShallow(selectUser))

  if (user) return <Navigate to={ROUTES.HOME.path} />

  return (
    <section className={styles.section}>
      <div className={clsx('container', styles.container)}>
        <div className={styles.content}>
          <Title className={styles.title} level={1}>
            {isLogin ? 'Вход' : 'Регистрация'}
          </Title>
          {isLogin ? <LoginForm /> : <RegisterForm />}

          {isLogin ? (
            <Text className={styles.change}>
              Нет аккаунта? <Link onClick={() => setIsLogin(false)}>Зарегистрироваться</Link>
            </Text>
          ) : (
            <Text className={styles.change}>
              Есть аккаунт? <Link onClick={() => setIsLogin(true)}>Войти</Link>
            </Text>
          )}
        </div>
      </div>
    </section>
  )
}
