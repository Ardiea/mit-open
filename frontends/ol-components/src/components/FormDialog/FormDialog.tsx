import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Button, ActionButton } from "../Button/Button"
import type { ButtonProps } from "../Button/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import type { DialogProps } from "@mui/material/Dialog"
import Close from "@mui/icons-material/Close"

const topRightStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  right: 0,
}
interface FormDialogProps {
  /**
   * Whether the dialog is currently open.
   */
  open: boolean
  /**
   * Dialog title.
   */
  title: string
  /**
   * Called when modal is closed.
   */
  onClose: () => void
  /**
   * Form submission handler.
   */
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>
  /**
   * A callback to reset the form. Called automatically when `open` changes.
   */
  onReset: () => void
  /**
   * Sets `novalidate` on the `<form />` element.
   *
   * One scenario where this is useful is when we want to use JS to validate
   * form inputs but still semantically mark inputs as `<input required />`.
   */
  noValidate?: boolean
  /**
   * The form content. These will be direct children of MUI's [DialogContent](https://mui.com/material-ui/api/dialog-content/)
   */
  children?: React.ReactNode
  /**
   * Extra content below the cancel/submit buttons. This is useful, e.g., for
   * displaying overall form error messages.
   */
  footerContent?: React.ReactNode
  /**
   * Class applied to the `<form />` element.
   */
  formClassName?: string
  /**
   * Content (e.g., text) of cancel button in DialogActions
   */
  cancelButtonContent?: React.ReactNode
  /**
   * Content (e.g., text) of submit button in DialogActions
   */
  submitButtonContent?: React.ReactNode
  /**
   * Extra props passed to the cancel button
   */
  cancelButtonProps?: ButtonProps
  /**
   * Extra props passed to the cancel button
   */
  submitButtonProps?: ButtonProps
  /**
   * MUI Dialog's [TransitionProps](https://mui.com/material-ui/api/dialog/#props)
   */
  TransitionProps?: DialogProps["TransitionProps"]
  /**
   * If `true`, the dialog stretches to its `maxWidth`.
   *
   * See [fullWidth](https://mui.com/material-ui/api/dialog/#Dialog-prop-fullWidth)
   */
  fullWidth?: boolean
}

/**
 * A wrapper around MUI's Dialog components to be used with forms. Includes a
 * `<form />` element as well as cancel and submit buttons.
 *
 * See Also
 * --------
 *  - {@link FormDialogProps}
 *  - [MUI Dialog](https://mui.com/material-ui/api/dialog/)
 *
 */
const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onSubmit,
  onReset,
  onClose,
  fullWidth,
  title,
  noValidate,
  formClassName,
  children,
  footerContent,
  cancelButtonContent = "Cancel",
  submitButtonContent = "Save",
  cancelButtonProps,
  submitButtonProps,
  TransitionProps,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      setIsSubmitting(true)
      try {
        await onSubmit(e)
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSubmit],
  )
  const paperProps = useMemo(() => {
    const className = formClassName ? { className: formClassName } : {}
    const props: DialogProps["PaperProps"] = {
      component: "form",
      ...className,
      // when component is "form", as above, PaperProps should include
      // `onSubmit` and other form properties but does not.
      // This is the recommended approach for ensuring modal form content is
      // scrollable within a MUI dialog. See https://github.com/mui/material-ui/issues/13253#issuecomment-512208440
      onSubmit: handleSubmit,
      noValidate,
    }
    return props
  }, [formClassName, handleSubmit, noValidate])

  useEffect(() => {
    onReset()
  }, [open, onReset])

  return (
    <Dialog
      keepMounted={false}
      open={open}
      fullWidth={fullWidth}
      onClose={onClose}
      PaperProps={paperProps}
      TransitionProps={TransitionProps}
    >
      <DialogTitle>{title}</DialogTitle>
      <div style={topRightStyle}>
        <ActionButton
          variant="text"
          color="secondary"
          onClick={onClose}
          aria-label="Close"
        >
          <Close />
        </ActionButton>
      </div>
      <DialogContent dividers={true}>{children}</DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose} {...cancelButtonProps}>
          {cancelButtonContent}
        </Button>
        <Button
          variant="filled"
          type="submit"
          disabled={isSubmitting}
          {...submitButtonProps}
        >
          {submitButtonContent}
        </Button>
      </DialogActions>
      {footerContent && <DialogContent>{footerContent}</DialogContent>}
    </Dialog>
  )
}

export { FormDialog }
export type { FormDialogProps }
