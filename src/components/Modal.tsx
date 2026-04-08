import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
  confirmDisabled?: boolean
  children?: React.ReactNode
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Potvrdi',
  cancelLabel = 'Otkaži',
  variant = 'danger',
  loading = false,
  confirmDisabled = false,
  children,
}: ModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <Dialog.Title className="text-lg font-semibold text-warm-900 mb-2">
                  {title}
                </Dialog.Title>

                {description && (
                  <Dialog.Description className="text-sm text-warm-600 mb-4">
                    {description}
                  </Dialog.Description>
                )}

                {children && <div className="mb-4">{children}</div>}

                <div className="flex gap-3 justify-end mt-6">
                  <Button variant="ghost" onClick={onClose} disabled={loading}>
                    {cancelLabel}
                  </Button>
                  {onConfirm && (
                    <Button
                      variant={variant}
                      onClick={onConfirm}
                      loading={loading}
                      disabled={confirmDisabled || loading}
                    >
                      {confirmLabel}
                    </Button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
