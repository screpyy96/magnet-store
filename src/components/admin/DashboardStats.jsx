// Adaugă sau actualizează funcția de calcul a comenzilor în așteptare
const calculatePendingOrders = (orders) => {
  if (!orders) return 0;
  return orders.filter(order => 
    order.status === 'processing' || order.status === 'pending'
  ).length;
};

// În componenta unde renderezi statisticile 
// (înlocuiește secțiunea existentă a comenzilor în așteptare)

<StatCard 
  title="Comenzi în Așteptare"
  value={calculatePendingOrders(orders)}
  description="Necesită procesare"
  icon={<ClipboardList className="h-8 w-8 text-blue-500" />}
/> 