import type { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  text: string;
  indent?: boolean;
}

export default function StreamItem({ icon, text, indent }: Props) {
  return (
    <div className={`si ${indent ? 'si-indent' : ''}`}>
      <div className="si-icon">{icon}</div>
      <div className="si-text">{text}</div>
    </div>
  );
}
