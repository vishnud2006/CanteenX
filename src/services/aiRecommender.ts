import {
  FoodItem,
  RecommendationCombo,
  CanteenQueueMetrics,
  Announcement
} from '../types';
import { calculateItemWaitTime, getBreakTimingAdvice } from './queueIntelligence';

export interface ParsedStudentIntent {
  budget?: number;
  timeLimit?: number; // in minutes
  dietaryFilter?: 'veg' | 'non-veg' | 'egg' | 'vegan';
  preferenceTags: string[];
  isLookingForCombo: boolean;
  categoryHint?: string;
  wantsFilling: boolean;
  wantsLight: boolean;
  wantsBestValue: boolean;
  wantsQuick: boolean;
  itemKeyword?: string;
  rawQuery: string;
}

/**
 * Natural language intent parser for student canteen queries
 */
export function parseStudentQuery(query: string): ParsedStudentIntent {
  const lower = query.toLowerCase().trim();
  const intent: ParsedStudentIntent = {
    preferenceTags: [],
    isLookingForCombo: false,
    wantsFilling: false,
    wantsLight: false,
    wantsBestValue: false,
    wantsQuick: false,
    rawQuery: query
  };

  // 1. Extract Budget (e.g. ₹60, rs 60, under 50, budget 70)
  const budgetRegexes = [
    /(?:₹|rs\.?|inr)\s*(\d+)/i,
    /(\d+)\s*(?:₹|rs\.?|rupees|inr)/i,
    /under\s*(?:₹|rs\.?)?\s*(\d+)/i,
    /budget\s*(?:of|is|:)?\s*(?:₹|rs\.?)?\s*(\d+)/i,
    /within\s*(?:₹|rs\.?)?\s*(\d+)/i,
    /for\s*(?:₹|rs\.?)?\s*(\d+)/i,
    /have\s*(?:₹|rs\.?)?\s*(\d+)/i
  ];

  for (const regex of budgetRegexes) {
    const match = lower.match(regex);
    if (match && match[1]) {
      const val = parseInt(match[1], 10);
      if (val > 0 && val <= 500) {
        intent.budget = val;
        break;
      }
    }
  }

  // 2. Extract Time (e.g. 10 min, 5 minutes, 15m)
  const timeRegexes = [
    /(\d+)\s*(?:min|mins|minute|minutes|m)\b/i,
    /in\s*(\d+)\s*(?:min|mins|minute|minutes)/i,
    /have\s*(\d+)\s*(?:min|mins|minute|minutes)/i
  ];

  for (const regex of timeRegexes) {
    const match = lower.match(regex);
    if (match && match[1]) {
      const val = parseInt(match[1], 10);
      if (val > 0 && val <= 120) {
        intent.timeLimit = val;
        break;
      }
    }
  }

  // 3. Extract Dietary Filter
  if (lower.includes('vegan') || lower.includes('plant based')) {
    intent.dietaryFilter = 'vegan';
  } else if (lower.includes('non-veg') || lower.includes('non veg') || lower.includes('chicken') || lower.includes('egg')) {
    intent.dietaryFilter = 'non-veg';
  } else if (lower.includes('pure veg') || lower.includes('vegetarian') || lower.includes('veg only') || lower.includes(' veg ')) {
    intent.dietaryFilter = 'veg';
  }

  // 4. Intent & keywords
  if (lower.includes('combo') || lower.includes('pair') || lower.includes('drink and snack') || lower.includes('meal and drink') || lower.includes('+')) {
    intent.isLookingForCombo = true;
  }
  if (lower.includes('filling') || lower.includes('heavy') || lower.includes('lunch') || lower.includes('hungry') || lower.includes('full meal')) {
    intent.wantsFilling = true;
    intent.categoryHint = 'Meals';
  }
  if (lower.includes('quick') || lower.includes('fast') || lower.includes('rush') || lower.includes('hurry') || lower.includes('late')) {
    intent.wantsQuick = true;
  }
  if (lower.includes('cheap') || lower.includes('value') || lower.includes('pocket friendly') || lower.includes('saver')) {
    intent.wantsBestValue = true;
  }

  // Check specific food keywords
  const foodKeywords = ['dosa', 'samosa', 'idli', 'noodles', 'bhature', 'chai', 'tea', 'coffee', 'juice', 'sandwich', 'brownie', 'rice', 'fries', 'paratha'];
  for (const kw of foodKeywords) {
    if (lower.includes(kw)) {
      intent.itemKeyword = kw;
      break;
    }
  }

  return intent;
}

/**
 * Queue-Aware AI Recommender Engine
 */
export function generateAIRecommendations(
  query: string,
  menu: FoodItem[],
  studentDietaryPref: string = 'veg',
  remainingBreakMins: number = 18,
  queueMetrics?: CanteenQueueMetrics,
  studentBudget: number = 60
): {
  recommendations: RecommendationCombo[];
  closestOptions?: FoodItem[];
  isImpossibleMatch?: boolean;
  responseText: string;
  intent: ParsedStudentIntent;
  rushWarning?: string;
  fastAlternatives?: FoodItem[];
} {
  const intent = parseStudentQuery(query);
  const budget = intent.budget || studentBudget;
  const breakTime = intent.timeLimit || remainingBreakMins;
  const dietaryPref = intent.dietaryFilter || (studentDietaryPref !== 'all' ? studentDietaryPref : undefined);
  const defaultMetrics = queueMetrics || {
    collegeId: menu[0]?.collegeId || 'BCE001',
    rushLevel: 'low' as const,
    activeOrdersCount: 4,
    preparingCount: 2,
    waitingCount: 2,
    kitchenLoadPercent: 25,
    estimatedWaitMin: 2,
    estimatedWaitMax: 6,
    averagePrepTime: 4,
    queueDelayMinutes: 2,
    peakPeriod: '12:30 PM – 1:30 PM',
    isPeakPeriod: false,
    counterLoads: [],
    insightMessage: 'Low crowd'
  };

  const isCanteenHighRush = defaultMetrics.rushLevel === 'high';

  // 1. Strict filter: Must be currently available and in stock!
  const availableItems = menu.filter(item => item.isAvailable && item.availableQuantity > 0);

  if (availableItems.length === 0) {
    return {
      recommendations: [],
      isImpossibleMatch: true,
      responseText: "⚠️ Sorry! The canteen kitchen is currently restocking or all items are sold out. Please check back in a few minutes.",
      intent
    };
  }

  // 2. Filter by dietary preference
  let eligibleItems = availableItems;
  if (dietaryPref === 'veg') {
    eligibleItems = eligibleItems.filter(item => item.dietaryType === 'veg' || item.dietaryType === 'vegan');
  } else if (dietaryPref === 'vegan') {
    eligibleItems = eligibleItems.filter(item => item.dietaryType === 'vegan');
  } else if (dietaryPref === 'egg') {
    eligibleItems = eligibleItems.filter(item => item.dietaryType === 'veg' || item.dietaryType === 'egg');
  }

  // 3. Check for specific item query with RUSH WARNING (e.g. student asked for "Masala Dosa" when queue is high)
  let rushWarning: string | undefined;
  let fastAlternatives: FoodItem[] | undefined;

  if (intent.itemKeyword) {
    const requestedItem = eligibleItems.find(i => i.name.toLowerCase().includes(intent.itemKeyword!));
    if (requestedItem) {
      const wait = calculateItemWaitTime(requestedItem, defaultMetrics);
      if (wait.totalEstimatedReady > breakTime) {
        rushWarning = `⚠️ ${requestedItem.name} takes ${requestedItem.preparationTime} min prep + ${wait.queueDelay} min queue = ~${wait.totalEstimatedReady} min total, which exceeds your remaining ${breakTime}-minute break.`;
        // Find fastest available items
        fastAlternatives = [...eligibleItems]
          .filter(i => i.id !== requestedItem.id && i.price <= budget)
          .sort((a, b) => {
            const wA = calculateItemWaitTime(a, defaultMetrics).totalEstimatedReady;
            const wB = calculateItemWaitTime(b, defaultMetrics).totalEstimatedReady;
            return wA - wB;
          })
          .slice(0, 3);
      }
    }
  }

  // 4. Filter items that can fit budget and remaining break time
  const itemsWithLiveTime = eligibleItems.map(item => {
    const wait = calculateItemWaitTime(item, defaultMetrics);
    const timingAdvice = getBreakTimingAdvice(wait.totalEstimatedReady, breakTime);
    return {
      item,
      wait,
      totalReadyTime: wait.totalEstimatedReady,
      timingAdvice,
      fitsTime: wait.totalEstimatedReady <= breakTime
    };
  });

  const fittingItems = itemsWithLiveTime
    .filter(i => i.item.price <= budget && i.fitsTime)
    .map(i => i.item);

  let pool = fittingItems.length > 0 ? fittingItems : eligibleItems;

  const generatedCombos: RecommendationCombo[] = [];

  const mains = pool.filter(i => i.category === 'Breakfast' || i.category === 'Meals' || i.category === 'Snacks');
  const beverages = pool.filter(i => i.category === 'Beverages' || i.category === 'Desserts');

  // Generate Combos
  if (mains.length > 0 && beverages.length > 0) {
    for (const main of mains) {
      for (const bev of beverages) {
        const comboPrice = main.price + bev.price;
        const mainWait = calculateItemWaitTime(main, defaultMetrics);
        const bevWait = calculateItemWaitTime(bev, defaultMetrics);
        const comboTotalTime = Math.max(mainWait.totalEstimatedReady, bevWait.totalEstimatedReady);

        const fitsBudget = comboPrice <= budget;
        const fitsBreak = comboTotalTime <= breakTime;

        if (fitsBudget && fitsBreak) {
          let score = main.popularity + bev.popularity;

          if (comboPrice === budget) score += 30;
          if (comboTotalTime <= 6) score += 40;

          // Priority pairings
          if (main.name.includes('Samosa') && bev.name.includes('Lemon Juice')) score += 70;
          if (main.name.includes('Masala Dosa') && bev.name.includes('Lemon Juice') && !isCanteenHighRush) score += 50;

          let badge = 'BEST FOR YOUR BREAK ⚡';
          if (comboTotalTime <= 5) badge = '⚡ READY FAST (≤5 min)';
          else if (comboPrice === budget) badge = `🎯 EXACT ₹${budget} MATCH`;

          let reason = `Fits your ₹${budget} budget and will be ready in ~${comboTotalTime} min (${breakTime - comboTotalTime}m buffer before class).`;
          if (isCanteenHighRush && comboTotalTime <= 6) {
            reason = `High canteen rush detected. This pairing is ready in ~${comboTotalTime} min, making it the safest pick for your ${breakTime}-minute break.`;
          }

          generatedCombos.push({
            id: `combo-${main.id}-${bev.id}`,
            title: `${main.name} + ${bev.name}`,
            items: [main, bev],
            totalPrice: comboPrice,
            maxPrepTime: Math.max(main.preparationTime, bev.preparationTime),
            queueDelay: defaultMetrics.queueDelayMinutes,
            estimatedReadyTime: comboTotalTime,
            reason,
            badge,
            isAvailable: true,
            fitsBudget: true,
            fitsBreak: true,
            timingAdvice: getBreakTimingAdvice(comboTotalTime, breakTime)
          });
        }
      }
    }
  }

  // Single item fallbacks if combos are empty
  if (generatedCombos.length === 0 && pool.length > 0) {
    const sortedPool = [...pool].sort((a, b) => {
      const wA = calculateItemWaitTime(a, defaultMetrics).totalEstimatedReady;
      const wB = calculateItemWaitTime(b, defaultMetrics).totalEstimatedReady;
      return wA - wB;
    });

    sortedPool.slice(0, 3).forEach(item => {
      const wait = calculateItemWaitTime(item, defaultMetrics);
      generatedCombos.push({
        id: `single-${item.id}`,
        title: item.name,
        items: [item],
        totalPrice: item.price,
        maxPrepTime: item.preparationTime,
        queueDelay: wait.queueDelay,
        estimatedReadyTime: wait.totalEstimatedReady,
        reason: `Quick single item ready in ~${wait.totalEstimatedReady} min within your ₹${budget} budget.`,
        badge: wait.totalEstimatedReady <= 5 ? '⚡ FAST PICK' : 'RECOMMENDED',
        isAvailable: true,
        fitsBudget: item.price <= budget,
        fitsBreak: wait.totalEstimatedReady <= breakTime,
        timingAdvice: getBreakTimingAdvice(wait.totalEstimatedReady, breakTime)
      });
    });
  }

  generatedCombos.sort((a, b) => (a.estimatedReadyTime || 0) - (b.estimatedReadyTime || 0));

  let responseText = '';
  if (rushWarning) {
    responseText += `${rushWarning}\n\n`;
  }

  if (isCanteenHighRush) {
    responseText += `🔴 High Canteen Rush (${defaultMetrics.activeOrdersCount} orders in queue). Here are the safest, fastest choices for your ${breakTime}-minute break:`;
  } else if (generatedCombos.length > 0) {
    responseText += `Based on your ₹${budget} budget, ${breakTime}-minute break, and current canteen queue (${defaultMetrics.rushLevel} rush), here is today's best option:`;
  } else {
    responseText += `Here are the closest available options from today's menu:`;
  }

  return {
    recommendations: generatedCombos.slice(0, 3),
    closestOptions: generatedCombos.length === 0 ? eligibleItems.slice(0, 3) : undefined,
    isImpossibleMatch: generatedCombos.length === 0,
    responseText,
    intent,
    rushWarning,
    fastAlternatives
  };
}

export const PRESET_AI_PROMPTS = [
  '⚡ What can I get under 5 mins?',
  '💰 Best combo under ₹60',
  '🥟 I want something hot and spicy',
  '🧃 Quick beverage on the go',
  '🍛 Filling lunch for my 20m break'
];

export const CANTEEN_ANNOUNCEMENTS: Announcement[] = [
  { id: 'ann-1', icon: '🔥', text: 'Special Masala Chai freshly brewed at Beverage Counter', tag: 'hot' },
  { id: 'ann-2', icon: '⚡', text: 'Queue is moving fast: Average pickup wait ~5 mins', tag: 'rush' },
  { id: 'ann-3', icon: '🥞', text: 'Crispy Masala Dosa hot on the tawa — reserve now', tag: 'stock' }
];
