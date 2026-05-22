import { uploadDocuments } from '@/shared/api'
import { unwrapApi } from '@/shared/lib'
import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import { message, Modal, Upload } from 'antd'
import type { UploadFile } from 'antd/es/upload/interface'
import clsx from 'clsx'
import { useRef, useState, type FC } from 'react'
import styles from './UploadDocsModal.module.css'

interface IUploadDocsModal {
  open: boolean
  onClose: () => void
  onUploaded?: () => void
}

export const UploadDocsModal: FC<IUploadDocsModal> = ({ open, onClose, onUploaded }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const errorShownRef = useRef(false)
  const [loading, setIsLoading] = useState(false)

  const handleUpload = async () => {
    if (!fileList.length) {
      message.error('Выберите файлы')
      return
    }

    setIsLoading(true)

    try {
      const files = fileList
        .map((file) => file.originFileObj)
        .filter((file): file is NonNullable<typeof file> => Boolean(file))

      await unwrapApi(
        uploadDocuments({
          body: {
            files,
          },
        }),
      )

      message.success('Документы отправлены на проверку')
      setFileList([])
      onUploaded?.()
      onClose()
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Не удалось загрузить документы')
    } finally {
      setIsLoading(false)
    }
  }

  const getFileKey = (file: UploadFile) => {
    const uploadFile = file.originFileObj
    return uploadFile ? `${uploadFile.name}-${uploadFile.size}-${uploadFile.lastModified}` : file.uid
  }

  return (
    <Modal
      className={styles.modal}
      open={open}
      onCancel={() => {
        onClose()
        setFileList([])
      }}
      closable={!!fileList.length}
      title={fileList.length ? 'Загрузка файлов' : null}
      footer={
        fileList.length ? (
          <>
            <ButtonField
              onClick={() => setFileList([])}
              isSecondary
              className={styles.secondaryButton}
              loading={loading}
            >
              Очистить
            </ButtonField>

            <ButtonField type='primary' isPrimary onClick={handleUpload} loading={loading}>
              Отправить
            </ButtonField>
          </>
        ) : null
      }
      onOk={handleUpload}
      confirmLoading={loading}
    >
      <div className={styles.content}>
        <Upload
          className={clsx(styles.upload, !fileList.length && styles.isUpload)}
          multiple
          fileList={fileList}
          listType='picture'
          accept='image/*,.pdf,application/pdf'
          beforeUpload={(file) => {
            const isLt5MB = file.size / 1024 / 1024 < 5

            if (!isLt5MB) {
              message.error('Файл должен быть меньше 5MB')
              return Upload.LIST_IGNORE
            }

            return false
          }}
          onChange={({ fileList: newFileList }) => {
            const map = new Map<string, UploadFile>()
            newFileList.forEach((file) => {
              map.set(getFileKey(file), file)
            })

            let updatedList = Array.from(map.values())

            if (updatedList.length > 10) {
              if (!errorShownRef.current) {
                message.error('Максимум 10 файлов')
                errorShownRef.current = true
              }

              updatedList = updatedList.slice(0, 10)
            } else {
              errorShownRef.current = false
            }

            setFileList(updatedList)
          }}
          onRemove={(file) => {
            setFileList((prev) => prev.filter((f) => f.uid !== file.uid))
          }}
        >
          {!fileList.length && <div className={styles.uploadButton}>Выбрать файлы</div>}
        </Upload>
      </div>
    </Modal>
  )
}
