import {
  Order,
  FoodItem,
  FoodCategory,
  CanteenQueueMetrics,
  QueueRushLevel,
  CounterLoad,
  BreakTimingAdvice
} from '../types';

/**
 * Nominal parameters for college canteen queue calculation
 */
export const QUEUE_CONFIG = {
  PARALLEL_STATIONS: 4, // Kitchen has 4 concurrent prep stations
  LOW_RUSH_MAX_ORDERS: 6,
  MODERATE_RUSH_MAX_ORDERS: 18,
  HIGH_RUSH_THRESHOLD: 19,
  MAX_NOMINAL_CAPACITY_ORDERS: 32
};

/**
 * Deterministic calculation of canteen crowd, queue delays, and kitchen load
 * strictly scoped to a single collegeId
 */
export function calculateCanteenQueueMetrics(
  allOrders: Order[],
  collegeId: string,
  collegeMenu: FoodItem[] = []
): CanteenQueueMetrics {
  // 1. Strictly isolate orders by collegeId
  const collegeOrders = allOrders.filter(o => o.collegeId === collegeId);

  // 2. Count active orders in queue (received, confirmed, preparing)
  const activeOrders = collegeOrders.filter(
    o => o.status === 'received' || o.status === 'confirmed' || o.status === 'preparing'
  );

  const preparingOrders = activeOrders.filter(o => o.status === 'preparing');
  const waitingOrders = activeOrders.filter(o => o.status === 'received' || o.status === 'confirmed');

  const activeOrdersCount = activeOrders.length;
  const preparingCount = preparingOrders.length;
  const waitingCount = waitingOrders.length;

  // 3. Calculate average prep time of currently queued items
  let totalActiveItemPrepTime = 0;
  let totalActiveItemsCount = 0;

  activeOrders.forEach(o => {
    o.items.forEach(item => {
      totalActiveItemPrepTime += (item.prepTime || 5) * item.quantity;
      totalActiveItemsCount += item.quantity;
    });
  });

  const averagePrepTime = totalActiveItemsCount > 0
    ? Math.round(totalActiveItemPrepTime / totalActiveItemsCount)
    : 5;

  // 4. Calculate queue delay minutes
  // Formula: floor(waiting items / parallel stations) * average prep time + baseline preparing delay
  let queueDelayMinutes = 0;
  if (activeOrdersCount > 0) {
    const queueBatches = Math.ceil(waitingCount / QUEUE_CONFIG.PARALLEL_STATIONS);
    const preparingOverflow = Math.max(0, preparingCount - QUEUE_CONFIG.PARALLEL_STATIONS);
    queueDelayMinutes = (queueBatches * Math.min(averagePrepTime, 2)) + Math.ceil(preparingOverflow * 0.8);
    queueDelayMinutes = Math.min(15, Math.max(1, queueDelayMinutes));
  }

  // 5. Calculate estimated wait range
  const estimatedWaitMin = Math.max(1, queueDelayMinutes + (activeOrdersCount > 0 ? 2 : 0));
  const estimatedWaitMax = Math.max(estimatedWaitMin + 2, queueDelayMinutes + averagePrepTime + 2);

  // 6. Calculate Kitchen Load %
  const rawLoadPercent = Math.round((activeOrdersCount / QUEUE_CONFIG.MAX_NOMINAL_CAPACITY_ORDERS) * 100);
  const kitchenLoadPercent = Math.min(96, Math.max(8, activeOrdersCount === 0 ? 8 : rawLoadPercent));

  // 7. Determine Rush Level (Low / Moderate / High)
  let rushLevel: QueueRushLevel = 'low';
  if (activeOrdersCount >= QUEUE_CONFIG.HIGH_RUSH_THRESHOLD || queueDelayMinutes >= 8 || kitchenLoadPercent >= 75) {
    rushLevel = 'high';
  } else if (activeOrdersCount >= QUEUE_CONFIG.LOW_RUSH_MAX_ORDERS || queueDelayMinutes >= 4 || kitchenLoadPercent >= 40) {
    rushLevel = 'moderate';
  }

  // 8. Counter Load breakdown
  const counterLoads: CounterLoad[] = (['Breakfast', 'Snacks', 'Meals', 'Beverages', 'Desserts'] as FoodCategory[]).map(cat => {
    let catItemCount = 0;
    activeOrders.forEach(o => {
      o.items.forEach(item => {
        const menuItem = collegeMenu.find(m => m.id === item.foodId);
        if (menuItem && menuItem.category === cat) {
          catItemCount += item.quantity;
        } else if (item.foodName.toLowerCase().includes(cat.toLowerCase())) {
          catItemCount += item.quantity;
        }
      });
    });

    const catLoad = Math.min(98, Math.max(10, Math.round((catItemCount / 10) * 100)));
    const catRush: QueueRushLevel = catLoad >= 70 ? 'high' : catLoad >= 40 ? 'moderate' : 'low';

    return {
      category: cat,
      loadPercent: catLoad,
      activeItems: catItemCount,
      rushLevel: catRush
    };
  });

  // 9. Peak Period Detection (Simulated 12:30 PM - 1:30 PM lunch break peak)
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const isTimeInPeak = (currentHour === 12 && currentMinutes >= 30) || (currentHour === 13 && currentMinutes <= 30) || rushLevel === 'high';
  const peakPeriod = '12:30 PM – 1:30 PM (Lunch Rush)';

  // 10. Natural-Language Insight Message
  let insightMessage = '🟢 Canteen crowd is light. Orders are getting prepared quickly without delay.';
  if (rushLevel === 'high') {
    insightMessage = `🔴 High canteen rush (${activeOrdersCount} active orders). Queue delay is ~${queueDelayMinutes} min. Quick snack & beverage items (≤3 min) are recommended.`;
  } else if (rushLevel === 'moderate') {
    insightMessage = `🟡 Moderate crowd (${activeOrdersCount} orders in queue). Kitchen is operating at ${kitchenLoadPercent}% capacity.`;
  }

  return {
    collegeId,
    rushLevel,
    activeOrdersCount,
    preparingCount,
    waitingCount,
    kitchenLoadPercent,
    estimatedWaitMin,
    estimatedWaitMax,
    averagePrepTime,
    queueDelayMinutes,
    peakPeriod,
    isPeakPeriod: isTimeInPeak,
    counterLoads,
    insightMessage
  };
}

/**
 * Calculates item-specific estimated wait time taking into account category counter speed
 */
export function calculateItemWaitTime(
  item: FoodItem,
  queueMetrics: CanteenQueueMetrics
): { prepTime: number; queueDelay: number; totalEstimatedReady: number } {
  const prepTime = item.preparationTime;
  let queueDelay = queueMetrics.queueDelayMinutes;

  if (item.category === 'Beverages' || item.category === 'Desserts') {
    queueDelay = Math.min(2, Math.ceil(queueMetrics.queueDelayMinutes * 0.25));
  } else if (item.category === 'Snacks') {
    queueDelay = Math.min(3, Math.ceil(queueMetrics.queueDelayMinutes * 0.4));
  }

  const totalEstimatedReady = prepTime + queueDelay;

  return {
    prepTime,
    queueDelay,
    totalEstimatedReady
  };
}

/**
 * Generates break-time compatibility advice
 */
export function getBreakTimingAdvice(
  totalEstimatedReady: number,
  breakMinutesLeft: number
): BreakTimingAdvice {
  if (breakMinutesLeft <= 0) {
    return {
      status: 'risky',
      label: '🔴 BREAK OVER',
      explanation: 'Your break has finished. Food will be ready after your class starts.'
    };
  }

  if (totalEstimatedReady <= breakMinutesLeft - 2) {
    return {
      status: 'good',
      label: '🟢 GOOD TIME TO ORDER',
      explanation: `Ready in ~${totalEstimatedReady}m (well before your ${breakMinutesLeft}m break ends).`
    };
  }

  if (totalEstimatedReady <= breakMinutesLeft + 2) {
    return {
      status: 'tight',
      label: '🟠 TIGHT TIMING',
      explanation: `Ready in ~${totalEstimatedReady}m (leaves little or no margin for your ${breakMinutesLeft}m break).`
    };
  }

  return {
    status: 'risky',
    label: '🔴 NOT RECOMMENDED',
    explanation: `Takes ~${totalEstimatedReady}m (exceeds your remaining ${breakMinutesLeft}m break).`
  };
}
