interface Props {
  children: React.ReactNode;
}

export default function AIMessage({ children }: Props) {
  return <div className="ai-message">{children}</div>;
}
