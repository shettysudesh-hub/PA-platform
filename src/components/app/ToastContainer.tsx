import { Toast } from '@innovaccer/design-system';
import { useToastStore } from '../../store/useToastStore';
import './ToastContainer.css';

export function ToastContainer() {
  const { toasts, remove } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container d-flex flex-column">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          title={t.title}
          appearance={t.appearance}
          message={t.message}
          onClose={() => remove(t.id)}
        />
      ))}
    </div>
  );
}
