import { useState } from 'react';
import '../styles.css';
import WorklistView from '../components/Worklist/WorklistView';
import FeedView from '../components/Feed/FeedView';
import type { Order } from '../data/mockData';

export default function PriorAuthPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (selectedOrder) {
    return <FeedView order={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  return <WorklistView onSelect={setSelectedOrder} />;
}
