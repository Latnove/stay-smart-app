import { ListingCategoriesRecord, type Listing } from '@/entities/listing'
import { createListing, getListingById, updateListing } from '@/shared/api'
import { mapListing, unwrapApi } from '@/shared/lib'
import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import { ErrorText } from '@/shared/ui/Error/ErrorText'
import { InputField } from '@/shared/ui/InputField/InputField'
import { SelectField } from '@/shared/ui/SelectField/SelectField'
import { TextareaField } from '@/shared/ui/TextareaField/TextareaField'
import { zodResolver } from '@hookform/resolvers/zod'
import { type InputProps, type UploadFile } from 'antd'
import message from 'antd/es/message'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import Upload from 'antd/es/upload/Upload'
import clsx from 'clsx'
import { useEffect, useState, type MouseEventHandler } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { createListingFormSchema, editListingFormSchema, type ListingFormType } from '../lib/validation'
import { statusOptions, type EditableListingStatus } from '../model/types'
import styles from './ListingForm.module.css'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface ListingFormProps {
  mode: 'create' | 'edit'
  listingId?: string
  onSubmit?: () => void
  size?: InputProps['size']
  onClose?: MouseEventHandler<HTMLElement>
}

export const ListingForm = ({ mode, listingId, onSubmit: submit, size, onClose }: ListingFormProps) => {
  const navigate = useNavigate()
  const isEdit = mode === 'edit'
  const schema = isEdit ? editListingFormSchema : createListingFormSchema
  const [listing, setListing] = useState<Listing | undefined>()
  const formStatus: EditableListingStatus = listing?.status ?? 'review'

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid, isDirty, isSubmitting },
  } = useForm<ListingFormType>({
    mode: 'onBlur',
    resolver: zodResolver(schema),
    defaultValues: {
      title: listing?.title ?? '',
      description: listing?.description ?? '',
      city: listing?.city ?? '',
      address: listing?.address ?? '',
      price: listing?.price ?? 0,
      maxGuests: listing?.maxGuests ?? 1,
      type: listing?.type ?? 'apartment',
      images:
        listing?.images.map(
          (image, index): UploadFile => ({
            uid: String(index),
            name: `image-${index}.jpg`,
            status: 'done',
            url: image,
          }),
        ) ?? [],
      status: isEdit ? formStatus : undefined,
    },
  })

  useEffect(() => {
    if (!isEdit || !listingId) return

    const loadListing = async () => {
      try {
        const response = await unwrapApi(
          getListingById({
            path: { id: listingId },
          }),
        )
        const nextListing = mapListing(response)

        setListing(nextListing)
        reset({
          title: nextListing.title,
          description: nextListing.description,
          city: nextListing.city,
          address: nextListing.address,
          price: nextListing.price,
          maxGuests: nextListing.maxGuests,
          type: nextListing.type,
          images: nextListing.images.map(
            (image, index): UploadFile => ({
              uid: String(index),
              name: `image-${index}.jpg`,
              status: 'done',
              url: image,
            }),
          ),
          status: nextListing.status,
        })
      } catch (error) {
        message.error(error instanceof Error ? error.message : 'Не удалось загрузить объявление')
      }
    }

    loadListing()
  }, [isEdit, listingId, reset])

  const getUploadFile = (file: UploadFile) => file.originFileObj

  const isValidUploadFile = (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      message.error('Можно загрузить только JPG, PNG или WEBP')
      return false
    }

    if (file.size > MAX_IMAGE_SIZE) {
      message.error('Файл должен быть меньше 5MB')
      return false
    }

    return true
  }

  const getUploadFiles = (images: UploadFile[]): Array<Blob | File> => {
    const fileKeys = new Set<string>()

    return images.flatMap((file) => {
      const uploadFile = getUploadFile(file)
      if (!uploadFile || !isValidUploadFile(uploadFile)) return []

      const fileKey = `${uploadFile.name}-${uploadFile.size}-${uploadFile.lastModified}`
      if (fileKeys.has(fileKey)) return []

      fileKeys.add(fileKey)
      return [uploadFile]
    })
  }

  const getUploadFileKey = (file: UploadFile) => {
    const uploadFile = getUploadFile(file)
    return uploadFile ? `${uploadFile.name}-${uploadFile.size}-${uploadFile.lastModified}` : (file.url ?? file.uid)
  }

  const getUploadedUrls = (images: UploadFile[]) =>
    images.map((file) => file.url).filter((url): url is string => Boolean(url))

  const onSubmit = async (values: ListingFormType) => {
    try {
      const uploadedFiles = getUploadFiles(values.images)

      if (isEdit && listingId) {
        await unwrapApi(
          updateListing({
            path: { id: listingId },
            body: {
              title: values.title,
              description: values.description,
              city: values.city,
              address: values.address,
              price: values.price,
              maxGuests: values.maxGuests,
              type: values.type,
              status: values.status,
              imageUrls: getUploadedUrls(values.images),
              images: uploadedFiles,
            },
          }),
        )
        message.success('Объявление обновлено')
      } else {
        if (uploadedFiles.length === 0) {
          message.error('Добавьте хотя бы одно изображение JPG, PNG или WEBP')
          return
        }

        await unwrapApi(
          createListing({
            body: {
              title: values.title,
              description: values.description,
              city: values.city,
              address: values.address,
              price: values.price,
              maxGuests: values.maxGuests,
              type: values.type,
              images: uploadedFiles,
            },
          }),
        )
        message.success('Объявление создано')
        navigate('/my-listings')
      }

      submit?.()
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Не удалось сохранить объявление')
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.header}>
        <div>
          <Title className={styles.title} level={1}>
            {isEdit ? 'Редактирование объявления' : 'Создание объявления'}
          </Title>
          <Text className={styles.subtitle}>
            Заполните данные недвижимости, которые будут видны пользователям в каталоге.
          </Text>
        </div>
      </div>

      <div className={styles.card}>
        <Title className={styles.blockTitle} level={2}>
          Основная информация
        </Title>

        <div className={styles.grid}>
          <label className={styles.label}>
            <Text className={styles.text}>Название:</Text>
            <InputField
              control={control}
              name='title'
              placeholder='Современная квартира в центре'
              size={size}
              isSuccessVisible
            />
          </label>

          <label className={styles.label}>
            <Text className={styles.text}>Тип недвижимости:</Text>

            <SelectField
              control={control}
              size={size}
              name='type'
              options={Object.entries(ListingCategoriesRecord).map(([value, item]) => ({
                value,
                label: item.text,
              }))}
            />
          </label>

          <label className={styles.label}>
            <Text className={styles.text}>Город:</Text>
            <InputField control={control} name='city' placeholder='Рига' size={size} isSuccessVisible />
          </label>

          <label className={styles.label}>
            <Text className={styles.text}>Адрес:</Text>
            <InputField control={control} name='address' placeholder='ул. Бривибас 12' size={size} isSuccessVisible />
          </label>

          <label className={styles.label}>
            <Text className={styles.text}>Цена за ночь:</Text>
            <InputField
              control={control}
              name='price'
              type='number'
              min={1}
              size={size}
              placeholder='520'
              isSuccessVisible
            />
          </label>

          <label className={styles.label}>
            <Text className={styles.text}>Максимум гостей:</Text>

            <InputField
              control={control}
              name='maxGuests'
              type='number'
              min={1}
              max={20}
              size={size}
              isSuccessVisible
            />
          </label>

          <label className={styles.labelWide}>
            <Text className={styles.text}>Описание:</Text>

            <TextareaField
              control={control}
              name='description'
              autoSize={{ minRows: 4, maxRows: 6 }}
              className={styles.textarea}
              size={size}
              placeholder='Расскажите о недвижимости, удобствах и преимуществах...'
              isSuccessVisible
            />
          </label>

          {isEdit && (
            <label className={styles.label}>
              <Text className={styles.text}>Статус:</Text>
              <SelectField control={control} name='status' size={size} options={statusOptions} isSuccessVisible />
            </label>
          )}

          <label className={styles.labelWide}>
            <Text className={styles.text}>Фотографии:</Text>

            <Controller
              control={control}
              name='images'
              render={({ field, fieldState: { error } }) => (
                <>
                  {error && <ErrorText error={error} />}

                  <Upload
                    multiple
                    listType='picture'
                    accept={ALLOWED_IMAGE_TYPES.join(',')}
                    beforeUpload={() => false}
                    fileList={field.value}
                    onChange={({ fileList }) => {
                      const fileKeys = new Set<string>()
                      const validFiles = fileList.filter((file) => {
                        const uploadFile = getUploadFile(file)
                        const fileKey = getUploadFileKey(file)

                        if (fileKeys.has(fileKey)) return false

                        if (!uploadFile) {
                          if (!file.url) return false
                          fileKeys.add(fileKey)
                          return true
                        }

                        const isValid = ALLOWED_IMAGE_TYPES.includes(uploadFile.type) && uploadFile.size <= MAX_IMAGE_SIZE
                        if (isValid) {
                          fileKeys.add(fileKey)
                        }

                        return isValid
                      })

                      field.onChange(validFiles.slice(0, 10))
                    }}
                    className={styles.upload}
                    itemRender={(originNode) => <div className={styles.uploadContent}>{originNode}</div>}
                  >
                    {field.value.length >= 10 ? null : (
                      <div className={styles.uploadContainer}>
                        <ButtonField
                          htmlType='button'
                          size='medium'
                          isSecondary
                          className={clsx(styles.secondary, styles.uploadButton)}
                        >
                          Прикрепить изображения
                        </ButtonField>
                      </div>
                    )}
                  </Upload>
                </>
              )}
            />
            <Text className={styles.uploadHint}>Максимум 10 изображений</Text>
          </label>
        </div>
      </div>

      <div className={styles.actions}>
        <ButtonField
          size='large'
          onClick={isEdit ? onClose : () => navigate(-1)}
          isSecondary
          className={styles.secondary}
        >
          Отмена
        </ButtonField>

        <ButtonField
          htmlType='submit'
          type='primary'
          size='large'
          isPrimary
          disabled={!isValid || !isDirty}
          loading={isSubmitting}
        >
          {isEdit ? 'Сохранить изменения' : 'Создать объявление'}
        </ButtonField>
      </div>
    </form>
  )
}
