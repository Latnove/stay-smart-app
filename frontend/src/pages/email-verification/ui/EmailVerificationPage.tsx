import { actionFavorites, useFavoritesStore } from '@/entities/favorite'
import { actionUser, selectUser, useUserStore } from '@/entities/user'
import { verifyEmail } from '@/shared/api'
import { ROUTES } from '@/shared/config'
import { mapUser, unwrapApi } from '@/shared/lib'
import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import Result from 'antd/es/result'
import Spin from 'antd/es/spin'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import styles from './EmailVerificationPage.module.css'

export const EmailVerificationPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useUserStore(useShallow(selectUser))
  const { setAuth } = useUserStore(useShallow(actionUser))
  const { syncFavoritesAfterLogin } = useFavoritesStore(useShallow(actionFavorites))
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')
  const code = searchParams.get('code')

  useEffect(() => {
    if (!code || user) return

    const confirmEmail = async () => {
      try {
        const auth = await unwrapApi(
          verifyEmail({
            body: { code },
          }),
        )

        if (!auth.user || !auth.accessToken) {
          throw new Error('Сервер не вернул данные авторизации')
        }

        setAuth(mapUser(auth.user), auth.accessToken)
        await syncFavoritesAfterLogin()
        setStatus('success')
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Не удалось подтвердить почту')
        setStatus('error')
      }
    }

    confirmEmail()
  }, [code, setAuth, syncFavoritesAfterLogin, user])

  if (user) return <Navigate to={ROUTES.HOME.path} replace />

  return (
    <section className={styles.section}>
      <div className={clsx('container', styles.container)}>
        <div className={styles.content}>
          {!code && (
            <>
              <Title className={styles.title} level={1}>
                Нет кода подтверждения
              </Title>
              <Text className={clsx(styles.text, styles.error)}>Откройте ссылку из письма ещё раз.</Text>
              <ButtonField type='primary' isPrimary size='large' onClick={() => navigate(ROUTES.AUTH.path)}>
                Вернуться к входу
              </ButtonField>
            </>
          )}

          {code && status === 'loading' && (
            <>
              <Spin size='large' />
              <Title className={styles.title} level={1}>
                Подтверждаем почту
              </Title>
              <Text className={styles.text}>Сейчас завершим регистрацию и сразу войдём в аккаунт.</Text>
            </>
          )}

          {code && status === 'success' && (
            <Result
              status='success'
              title='Почта подтверждена'
              subTitle='Аккаунт готов, вы уже авторизованы.'
              extra={
                <ButtonField type='primary' isPrimary size='large' onClick={() => navigate(ROUTES.HOME.path)}>
                  Перейти на главную
                </ButtonField>
              }
            />
          )}

          {code && status === 'error' && (
            <Result
              status='error'
              title='Не удалось подтвердить почту'
              subTitle={error}
              extra={
                <ButtonField type='primary' isPrimary size='large' onClick={() => navigate(ROUTES.AUTH.path)}>
                  Вернуться к регистрации
                </ButtonField>
              }
            />
          )}
        </div>
      </div>
    </section>
  )
}
