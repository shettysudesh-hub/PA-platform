import { Dialog } from '@innovaccer/design-system';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  appearance?: 'alert' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  appearance = 'alert',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      heading={title}
      description={description}
      primaryButtonLabel={confirmLabel}
      primaryButtonAppearance={appearance}
      primaryButtonCallback={onConfirm}
      secondaryButtonLabel={cancelLabel}
      secondaryButtonCallback={onCancel}
    />
  );
}
